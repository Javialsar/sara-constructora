import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const originLat = parseFloat(searchParams.get('originLat') || '');
    const originLng = parseFloat(searchParams.get('originLng') || '');
    const destLat = parseFloat(searchParams.get('destLat') || '');
    const destLng = parseFloat(searchParams.get('destLng') || '');

    if (isNaN(originLat) || isNaN(originLng) || isNaN(destLat) || isNaN(destLng)) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(osrmUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SARA-Constructora-Fletes/2.0'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json.code === 'Ok' && json.routes && json.routes.length > 0) {
        const route = json.routes[0];
        const distKm = +(route.distance / 1000).toFixed(2);
        const durMin = Math.round(route.duration / 60);
        const coords: [number, number][] = route.geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]]
        );

        return NextResponse.json({
          code: 'Ok',
          distanciaKm: Math.max(0.8, distKm),
          duracionMinutos: Math.max(2, durMin),
          coordenadasRuta: coords
        });
      }
    }

    return NextResponse.json({ code: 'NoRoute' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error en servicio de ruteo vial' }, { status: 500 });
  }
}
