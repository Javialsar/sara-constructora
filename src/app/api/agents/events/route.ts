import { NextRequest, NextResponse } from 'next/server';
import { SaraEventBus } from '@/lib/agents/event-bus';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const correlationId = searchParams.get('correlationId');

    const events = correlationId 
      ? SaraEventBus.getEventsForCorrelation(correlationId)
      : SaraEventBus.getRecentEvents();

    return NextResponse.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
