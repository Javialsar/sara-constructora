import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface StreetIntersectionItem {
  primaryStreet: string;
  crossStreet: string;
  title: string;
  lat: number;
  lng: number;
  distanceMeters: number;
}

interface CacheEntry {
  expiresAt: number;
  items: StreetIntersectionItem[];
}

const INTERSECTION_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(av\.?|avenida|calle|c\.|gral\.?|general|dr\.?|doctor|ing\.?|ingeniero|psje\.?|pasaje)\b/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isInEcuador(lat: number, lng: number): boolean {
  return lat >= -5.5 && lat <= 2.0 && lng >= -92.0 && lng <= -74.5;
}

/**
 * GET /api/fletes/intersections?street=...&cross=...&lat=...&lng=...&radius=4000
 * Obtiene en tiempo real TODAS las calles transversales que intersectan una calle principal
 * usando el grafo vial real de OpenStreetMap (Overpass) con caché en memoria.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawStreet = (searchParams.get('street') || '').trim();
    const rawCross = (searchParams.get('cross') || '').trim();
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const radius = Math.min(8000, Math.max(800, parseInt(searchParams.get('radius') || '4000', 10) || 4000));

    if (rawStreet.length < 3 || isNaN(lat) || isNaN(lng) || !isInEcuador(lat, lng)) {
      return NextResponse.json({ intersections: [] });
    }

    const normStreet = normalizeText(rawStreet);
    const normCross = normalizeText(rawCross);
    if (normStreet.length < 3) {
      return NextResponse.json({ intersections: [] });
    }

    // Clave de caché por calle normalizada + celda de ~2km
    const gridKey = `${normStreet}@${lat.toFixed(2)},${lng.toFixed(2)}`;
    const now = Date.now();
    let baseItems: StreetIntersectionItem[] | null = null;

    const cached = INTERSECTION_CACHE.get(gridKey);
    if (cached && cached.expiresAt > now) {
      baseItems = cached.items;
    } else {
      // Construir regex flexible (palabras significativas de la calle)
      const tokens = normStreet.split(' ').filter((t) => t.length >= 2);
      if (tokens.length === 0) {
        return NextResponse.json({ intersections: [] });
      }
      const regexPattern = tokens.map(escapeRegex).join('.*');

      // Overpass QL: buscar vías con nombre coincidente dentro del radio, sus nodos y TODAS las vías que comparten esos nodos
      const overpassQuery = `
        [out:json][timeout:6];
        way["highway"]["name"~"${regexPattern}",i](around:${radius},${lat.toFixed(5)},${lng.toFixed(5)})->.main;
        node(w.main)->.main_nodes;
        way(bn.main_nodes)["highway"]["name"]->.all_ways;
        (.all_ways; .main_nodes;);
        out body;
      `;

      const overpassEndpoints = [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
      ];

      let osmData: { elements?: Array<Record<string, unknown>> } | null = null;
      for (const endpoint of overpassEndpoints) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'SARA-Constructora-Fletes/2.1 (soporte@gruposara.ec)',
            },
            body: `data=${encodeURIComponent(overpassQuery)}`,
            signal: AbortSignal.timeout(4500),
          });
          if (res.ok) {
            osmData = await res.json();
            break;
          }
        } catch {
          // Intentar mirror siguiente
        }
      }

      if (!osmData?.elements || osmData.elements.length === 0) {
        return NextResponse.json({ intersections: [] });
      }

      const nodesMap = new Map<number, { lat: number; lng: number }>();
      const primaryWays: Array<{ name: string; nodes: number[] }> = [];
      const allWays: Array<{ name: string; normName: string; nodes: number[] }> = [];

      for (const el of osmData.elements) {
        if (el.type === 'node' && typeof el.id === 'number' && typeof el.lat === 'number' && typeof el.lon === 'number') {
          nodesMap.set(el.id, { lat: el.lat, lng: el.lon });
        } else if (el.type === 'way' && Array.isArray(el.nodes)) {
          const tags = (el.tags || {}) as Record<string, string>;
          const name = tags.name?.trim();
          if (!name) continue;
          const normName = normalizeText(name);
          const wayObj = { name, normName, nodes: el.nodes as number[] };
          allWays.push(wayObj);
          const matchesPrimary = tokens.every((tk) => normName.includes(tk));
          if (matchesPrimary) {
            primaryWays.push({ name, nodes: el.nodes as number[] });
          }
        }
      }

      // Mapear cada nodo de las vías principales -> nombre de vía principal
      const primaryNodeToName = new Map<number, string>();
      for (const pw of primaryWays) {
        for (const nid of pw.nodes) {
          if (!primaryNodeToName.has(nid)) {
            primaryNodeToName.set(nid, pw.name);
          }
        }
      }

      // Encontrar cada calle transversal que comparte nodo con la calle principal
      const seenCross = new Map<string, StreetIntersectionItem>();

      for (const w of allWays) {
        const isSameStreet = tokens.every((tk) => w.normName.includes(tk));
        if (isSameStreet) continue;

        for (const nid of w.nodes) {
          const primaryName = primaryNodeToName.get(nid);
          if (!primaryName) continue;
          const coords = nodesMap.get(nid);
          if (!coords) continue;

          const distM = Math.round(haversineMeters(lat, lng, coords.lat, coords.lng));
          const dedupKey = w.normName;
          const existing = seenCross.get(dedupKey);
          if (!existing || distM < existing.distanceMeters) {
            seenCross.set(dedupKey, {
              primaryStreet: primaryName,
              crossStreet: w.name,
              title: `${primaryName} y ${w.name}`,
              lat: Number(coords.lat.toFixed(6)),
              lng: Number(coords.lng.toFixed(6)),
              distanceMeters: distM,
            });
          }
        }
      }

      baseItems = Array.from(seenCross.values()).sort((a, b) => a.distanceMeters - b.distanceMeters);

      // Limitar tamaño de caché en memoria
      if (INTERSECTION_CACHE.size > 150) {
        const oldestKey = INTERSECTION_CACHE.keys().next().value;
        if (oldestKey) INTERSECTION_CACHE.delete(oldestKey);
      }
      INTERSECTION_CACHE.set(gridKey, { expiresAt: now + CACHE_TTL_MS, items: baseItems });
    }

    const filtered = normCross
      ? baseItems.filter((it) => normalizeText(it.crossStreet).includes(normCross))
      : baseItems;

    return NextResponse.json({
      intersections: filtered.slice(0, 15),
    });
  } catch (err) {
    return NextResponse.json(
      { intersections: [], error: err instanceof Error ? err.message : 'Error consultando intersecciones' },
      { status: 500 }
    );
  }
}
