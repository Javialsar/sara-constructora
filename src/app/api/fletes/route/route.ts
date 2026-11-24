import { NextRequest, NextResponse } from 'next/server';
import { traducirPasoOsrm, type PasoNavegacionVial } from '@/lib/fletes/saraVoiceNavigation';

export const dynamic = 'force-dynamic';

export interface RutaAlternativaApi {
  index: number;
  resumen: string;
  distanciaKm: number;
  duracionMinutos: number;
  coordenadasRuta: [number, number][];
  pasosNavegacion: PasoNavegacionVial[];
  ladoLlegada: 'izquierda' | 'derecha' | 'frente';
}

/**
 * Calcula si el predio de destino queda a la izquierda o derecha del vehículo
 * usando el producto cruz entre el último segmento vial y el vector hacia el destino real.
 */
function calcularLadoLlegada(
  coords: [number, number][],
  destLat: number,
  destLng: number
): 'izquierda' | 'derecha' | 'frente' {
  if (!coords || coords.length < 2) return 'frente';
  const prev = coords[coords.length - 2];
  const last = coords[coords.length - 1];
  const vx = last[1] - prev[1];
  const vy = last[0] - prev[0];
  const dx = destLng - last[1];
  const dy = destLat - last[0];

  const distM = Math.hypot(dy * 111320, dx * 111320);
  if (distM < 3) return 'frente';

  // En coordenadas (x=lng, y=lat): producto cruz > 0 implica izquierda del vector de avance
  const cross = vx * dy - vy * dx;
  if (Math.abs(cross) < 1e-11) return 'frente';
  return cross > 0 ? 'izquierda' : 'derecha';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const originLat = parseFloat(searchParams.get('originLat') || '');
    const originLng = parseFloat(searchParams.get('originLng') || '');
    const destLat = parseFloat(searchParams.get('destLat') || '');
    const destLng = parseFloat(searchParams.get('destLng') || '');
    const bearingParam = parseFloat(searchParams.get('bearing') || '');
    const wantAlternatives = searchParams.get('alternatives') !== 'false';

    if (isNaN(originLat) || isNaN(originLng) || isNaN(destLat) || isNaN(destLng)) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    // Construir URL OSRM con alternativas (hasta 3 rutas simultáneas estilo Google Maps) y rumbo opcional
    const osrmParams = new URLSearchParams({
      overview: 'full',
      geometries: 'geojson',
      steps: 'true',
      alternatives: wantAlternatives ? '3' : 'false'
    });
    if (!isNaN(bearingParam) && bearingParam >= 0 && bearingParam <= 360) {
      osrmParams.set('bearings', `${Math.round(bearingParam)},45;`);
    }

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?${osrmParams.toString()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(osrmUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SARA-Constructora-Fletes/2.1'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json.code === 'Ok' && Array.isArray(json.routes) && json.routes.length > 0) {
        const rutasAlternativas: RutaAlternativaApi[] = json.routes.map((route: any, rIdx: number) => {
          const distKm = Math.max(0.1, +(route.distance / 1000).toFixed(2));
          const durMin = Math.max(1, Math.round(route.duration / 60));
          const coords: [number, number][] = route.geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]]
          );
          const ladoLlegada = calcularLadoLlegada(coords, destLat, destLng);
          const rawSteps = route.legs?.[0]?.steps || [];
          const pasosNavegacion: PasoNavegacionVial[] = rawSteps.map((s: any, idx: number) => {
            const paso = traducirPasoOsrm(s, idx);
            if (paso.maniobra === 'arrive' && ladoLlegada !== 'frente') {
              paso.instruccion = `Has llegado. El destino está a la ${ladoLlegada}`;
            }
            return paso;
          });

          const mainStreets = Array.from(
            new Set(
              rawSteps
                .map((s: any) => (s.name || '').trim())
                .filter((n: string) => n.length > 2)
            )
          ).slice(0, 2);
          const resumen = mainStreets.length > 0 ? `Vía ${mainStreets.join(' y ')}` : `Ruta ${rIdx + 1}`;

          return {
            index: rIdx,
            resumen,
            distanciaKm: distKm,
            duracionMinutos: durMin,
            coordenadasRuta: coords,
            pasosNavegacion,
            ladoLlegada
          };
        });

        const primary = rutasAlternativas[0];

        return NextResponse.json({
          code: 'Ok',
          distanciaKm: primary.distanciaKm,
          duracionMinutos: primary.duracionMinutos,
          coordenadasRuta: primary.coordenadasRuta,
          pasosNavegacion: primary.pasosNavegacion,
          ladoLlegada: primary.ladoLlegada,
          rutasAlternativas
        });
      }
    }

    return NextResponse.json({ code: 'NoRoute' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error en servicio de ruteo vial' }, { status: 500 });
  }
}
