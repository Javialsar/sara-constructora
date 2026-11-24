import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface GeocodeResultItem {
  titulo: string;
  subtitulo: string;
  lat: number;
  lng: number;
  ciudad?: string;
  provincia?: string;
  precision: 'rooftop' | 'street' | 'poi' | 'city';
  source: 'google' | 'nominatim' | 'photon';
  placeId?: string;
}

/**
 * Parsea numeración predial ecuatoriana (ej: "Paucarbamba 6-179, 010204 Cuenca", "Av. 24 de Mayo 7-77, Cuenca").
 */
function parseEcuadorianAddress(raw: string): {
  street?: string;
  housenumber?: string;
  postalcode?: string;
  city?: string;
} {
  const cleaned = raw.trim();
  const postalMatch = cleaned.match(/\b(0[1-9]\d{4}|1[0-9]\d{4}|2[0-4]\d{4})\b/);
  const postalcode = postalMatch ? postalMatch[1] : undefined;

  const withoutPostal = postalcode ? cleaned.replace(postalcode, '').trim() : cleaned;
  const parts = withoutPostal.split(',').map((p) => p.trim()).filter(Boolean);
  const firstPart = parts[0] || withoutPostal;
  const city = parts.length >= 2 ? parts[parts.length - 1] : undefined;

  // Detectar numeración tipo "6-179", "7-77", "N34-120", "Oe4-23", "E10-45" o simple "123"
  const numMatch = firstPart.match(/\b([A-Za-z]{0,2}\d{1,4}-\d{1,4}|\d{1,5})\b/);
  if (numMatch) {
    const housenumber = numMatch[1];
    const street = firstPart.replace(housenumber, '').replace(/\s{2,}/g, ' ').trim();
    if (street.length >= 3) {
      return { street, housenumber, postalcode, city };
    }
  }

  return { street: firstPart, postalcode, city };
}

function isInEcuador(lat: number, lng: number): boolean {
  return lat >= -5.5 && lat <= 2.0 && lng >= -92.0 && lng <= -74.5;
}

/**
 * GET /api/fletes/geocode?q=...&lat=...&lng=...&limit=6
 * Proveedor Dual de Geocodificación Predial Real:
 * - Si existe GOOGLE_MAPS_API_KEY en el servidor: consulta Google Geocoding / Places con precisión ROOFTOP.
 * - Caso contrario (Stack Abierto $0): consulta paralela a Photon (con sesgo de proximidad) +
 *   Nominatim estructurado (conservando numeración predial ecuatoriana como "6-179" y código postal).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const biasLat = parseFloat(searchParams.get('lat') || '');
    const biasLng = parseFloat(searchParams.get('lng') || '');
    const limit = Math.min(10, Math.max(1, parseInt(searchParams.get('limit') || '6', 10)));

    if (q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const hasBias = !isNaN(biasLat) && !isNaN(biasLng) && isInEcuador(biasLat, biasLng);
    const googleKey = process.env.GOOGLE_MAPS_API_KEY;

    // 1. Proveedor Premium Google Maps Platform (si la API key está configurada)
    if (googleKey) {
      try {
        const gParams = new URLSearchParams({
          address: q.toLowerCase().includes('ecuador') ? q : `${q}, Ecuador`,
          components: 'country:EC',
          language: 'es',
          key: googleKey
        });
        const gRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${gParams.toString()}`, {
          signal: AbortSignal.timeout(4000)
        });
        if (gRes.ok) {
          const gJson = await gRes.json();
          if (gJson.status === 'OK' && Array.isArray(gJson.results) && gJson.results.length > 0) {
            const results: GeocodeResultItem[] = gJson.results.slice(0, limit).map((item: any) => {
              const loc = item.geometry?.location;
              const locType = item.geometry?.location_type;
              const comps: any[] = item.address_components || [];
              const cityComp = comps.find((c) => c.types?.includes('locality') || c.types?.includes('administrative_area_level_2'));
              const provComp = comps.find((c) => c.types?.includes('administrative_area_level_1'));
              return {
                titulo: item.formatted_address?.split(',')[0] || q,
                subtitulo: item.formatted_address || 'Ecuador',
                lat: loc.lat,
                lng: loc.lng,
                ciudad: cityComp?.long_name,
                provincia: provComp?.long_name,
                precision: locType === 'ROOFTOP' || locType === 'RANGE_INTERPOLATED' ? 'rooftop' : 'street',
                source: 'google',
                placeId: item.place_id
              };
            });
            return NextResponse.json({ results, provider: 'google' });
          }
        }
      } catch {
        // Fallback automático a Stack Abierto
      }
    }

    // 2. Stack Abierto de Alta Precisión ($0): Nominatim estructurado + Photon en paralelo
    const parsed = parseEcuadorianAddress(q);
    const results: GeocodeResultItem[] = [];

    const photonParams = new URLSearchParams({
      q: q.toLowerCase().includes('ecuador') ? q : `${q}, Ecuador`,
      limit: String(limit),
      lang: 'es'
    });
    if (hasBias) {
      photonParams.set('lat', biasLat.toFixed(5));
      photonParams.set('lon', biasLng.toFixed(5));
    }

    // Nominatim estructurado si detectó numeración predial (ej: "Paucarbamba 6-179, Cuenca")
    const nomParams = new URLSearchParams({
      format: 'json',
      addressdetails: '1',
      countrycodes: 'ec',
      limit: String(limit),
      'accept-language': 'es'
    });
    if (parsed.housenumber && parsed.street) {
      nomParams.set('street', `${parsed.housenumber} ${parsed.street}`);
      if (parsed.city) nomParams.set('city', parsed.city);
      if (parsed.postalcode) nomParams.set('postalcode', parsed.postalcode);
    } else {
      nomParams.set('q', q.toLowerCase().includes('ecuador') ? q : `${q}, Ecuador`);
    }

    const [nomSettled, photonSettled] = await Promise.allSettled([
      fetch(`https://nominatim.openstreetmap.org/search?${nomParams.toString()}`, {
        headers: { 'User-Agent': 'SARA-Constructora-Fletes/2.1 (soporte@gruposara.ec)' },
        signal: AbortSignal.timeout(4500)
      }).then((r) => (r.ok ? r.json() : [])),
      fetch(`https://photon.komoot.io/api/?${photonParams.toString()}`, {
        headers: { 'User-Agent': 'SARA-Constructora-Fletes/2.1' },
        signal: AbortSignal.timeout(4500)
      }).then((r) => (r.ok ? r.json() : null))
    ]);

    // Procesar Nominatim
    if (nomSettled.status === 'fulfilled' && Array.isArray(nomSettled.value)) {
      for (const item of nomSettled.value) {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        if (isNaN(lat) || isNaN(lng) || !isInEcuador(lat, lng)) continue;
        const addr = item.address || {};
        const road = addr.road || addr.pedestrian || addr.residential || addr.amenity || item.name || q;
        const houseNum = addr.house_number ? ` ${addr.house_number}` : '';
        const city = addr.city || addr.town || addr.village || addr.county;
        const state = addr.state;
        const isHouse = Boolean(addr.house_number) || item.class === 'building' || item.type === 'house';
        const isCityOnly = item.class === 'boundary' || item.type === 'administrative' || item.type === 'city';

        results.push({
          titulo: `${road}${houseNum}`.trim(),
          subtitulo: [addr.suburb || addr.neighbourhood, city, state].filter(Boolean).join(', ') || item.display_name,
          lat,
          lng,
          ciudad: city,
          provincia: state,
          precision: isHouse ? 'rooftop' : isCityOnly ? 'city' : 'street',
          source: 'nominatim'
        });
      }
    }

    // Procesar Photon (muy bueno con POIs ecuatorianos como "Universidad del Azuay" + numeración)
    if (photonSettled.status === 'fulfilled' && photonSettled.value?.features) {
      for (const feat of photonSettled.value.features) {
        const coords = feat.geometry?.coordinates;
        if (!Array.isArray(coords) || coords.length < 2) continue;
        const lng = Number(coords[0]);
        const lat = Number(coords[1]);
        if (isNaN(lat) || isNaN(lng) || !isInEcuador(lat, lng)) continue;

        const p = feat.properties || {};
        const titleParts = [p.name, p.street, p.housenumber].filter(Boolean);
        const titulo = titleParts.length > 0 ? Array.from(new Set(titleParts)).join(' ') : q;
        const city = p.city || p.county || p.district;
        const state = p.state;
        const isHouse = Boolean(p.housenumber) || p.osm_key === 'building';
        const isPoi = p.osm_key === 'amenity' || p.osm_key === 'tourism' || p.osm_key === 'shop' || p.osm_key === 'office';
        const isCityOnly = p.osm_value === 'city' || p.osm_value === 'town' || p.osm_key === 'place';

        // Deduplicar si ya existe un punto a menos de 40 metros
        const isDup = results.some(
          (r) => Math.hypot((r.lat - lat) * 111320, (r.lng - lng) * 111320) < 40
        );
        if (isDup) continue;

        results.push({
          titulo,
          subtitulo: [p.street && p.name !== p.street ? p.street : null, city, state].filter(Boolean).join(', ') || 'Ecuador',
          lat,
          lng,
          ciudad: city,
          provincia: state,
          precision: isHouse ? 'rooftop' : isPoi ? 'poi' : isCityOnly ? 'city' : 'street',
          source: 'photon'
        });
      }
    }

    // Ordenar: rooftop > poi > street > city, y desempatar por proximidad al usuario si hay sesgo GPS
    const rankMap: Record<GeocodeResultItem['precision'], number> = {
      rooftop: 0,
      poi: 1,
      street: 2,
      city: 3
    };

    results.sort((a, b) => {
      const rankDiff = rankMap[a.precision] - rankMap[b.precision];
      if (rankDiff !== 0) return rankDiff;
      if (hasBias) {
        const dA = Math.hypot(a.lat - biasLat, a.lng - biasLng);
        const dB = Math.hypot(b.lat - biasLat, b.lng - biasLng);
        return dA - dB;
      }
      return 0;
    });

    return NextResponse.json({
      results: results.slice(0, limit),
      provider: 'open_stack'
    });
  } catch (err: any) {
    return NextResponse.json({ results: [], error: err?.message || 'Error en geocodificación' }, { status: 500 });
  }
}
