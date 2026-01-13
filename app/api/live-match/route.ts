import { NextResponse } from 'next/server';
import { readLiveMatch, writeLiveMatch } from '../../../lib/live-match-store';

export const dynamic = 'force-dynamic';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isValidEventType = (value: unknown): value is 'goal' | 'card' | 'substitution' | 'chance' =>
  value === 'goal' || value === 'card' || value === 'substitution' || value === 'chance';

export async function GET() {
  const liveMatch = await readLiveMatch();
  if (!liveMatch) {
    return NextResponse.json({ error: 'No live match data' }, { status: 404 });
  }
  return NextResponse.json(liveMatch);
}

export async function PUT(request: Request) {
  const payload = await request.json();
  const liveMatch = await readLiveMatch();

  if (!liveMatch) {
    return NextResponse.json({ error: 'No live match data' }, { status: 404 });
  }

  if (!Array.isArray(payload?.events)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const nextEvents = payload.events
    .filter((event: unknown) => typeof event === 'object' && event !== null)
    .map((event: Record<string, unknown>) => ({
      minute: Number(event.minute),
      team: isNonEmptyString(event.team) ? event.team.trim() : '',
      type: event.type,
      player: isNonEmptyString(event.player) ? event.player.trim() : '',
      detail: isNonEmptyString(event.detail) ? event.detail.trim() : '',
    }))
    .filter(
      (event: {
        minute: number;
        team: string;
        type: string;
        player: string;
        detail: string;
      }) =>
        Number.isFinite(event.minute) &&
        event.minute >= 0 &&
        isNonEmptyString(event.team) &&
        isValidEventType(event.type) &&
        isNonEmptyString(event.player) &&
        isNonEmptyString(event.detail)
    )
    .map(
      (event: {
        minute: number;
        team: string;
        type: string;
        player: string;
        detail: string;
      }) => ({ ...event, type: event.type as 'goal' | 'card' | 'substitution' | 'chance' })
    );

  const updated = { ...liveMatch, events: nextEvents };
  await writeLiveMatch(updated);
  return NextResponse.json(updated);
}
