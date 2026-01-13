import { NextResponse } from 'next/server';
import { readMatches, writeMatches } from '../../../lib/matches-store';

export const dynamic = 'force-dynamic';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export async function GET() {
  const matches = await readMatches();
  return NextResponse.json(matches);
}

export async function POST(request: Request) {
  const payload = await request.json();
  if (
    !isNonEmptyString(payload?.date) ||
    !isNonEmptyString(payload?.time) ||
    !isNonEmptyString(payload?.home) ||
    !isNonEmptyString(payload?.away) ||
    !isNonEmptyString(payload?.competition) ||
    !isNonEmptyString(payload?.stadium) ||
    (payload?.status !== 'upcoming' && payload?.status !== 'played')
  ) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const matches = await readMatches();
  const nextId = matches.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
  const newMatch = {
    id: nextId,
    date: payload.date.trim(),
    time: payload.time.trim(),
    home: payload.home.trim(),
    away: payload.away.trim(),
    competition: payload.competition.trim(),
    stadium: payload.stadium.trim(),
    status: payload.status,
    score: isNonEmptyString(payload.score) ? payload.score.trim() : undefined,
    result: payload.result === 'W' || payload.result === 'D' || payload.result === 'L' ? payload.result : undefined,
  };

  await writeMatches([...matches, newMatch]);
  return NextResponse.json(newMatch, { status: 201 });
}

export async function PUT(request: Request) {
  const payload = await request.json();
  if (typeof payload?.id !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const matches = await readMatches();
  const index = matches.findIndex((item) => item.id === payload.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const updated = {
    ...matches[index],
    date: isNonEmptyString(payload.date) ? payload.date.trim() : matches[index].date,
    time: isNonEmptyString(payload.time) ? payload.time.trim() : matches[index].time,
    home: isNonEmptyString(payload.home) ? payload.home.trim() : matches[index].home,
    away: isNonEmptyString(payload.away) ? payload.away.trim() : matches[index].away,
    competition: isNonEmptyString(payload.competition) ? payload.competition.trim() : matches[index].competition,
    stadium: isNonEmptyString(payload.stadium) ? payload.stadium.trim() : matches[index].stadium,
    status: payload.status === 'upcoming' || payload.status === 'played' ? payload.status : matches[index].status,
    score: isNonEmptyString(payload.score) ? payload.score.trim() : payload.score === '' ? undefined : matches[index].score,
    result: payload.result === 'W' || payload.result === 'D' || payload.result === 'L' ? payload.result : payload.result === '' ? undefined : matches[index].result,
  };

  const nextMatches = [...matches];
  nextMatches[index] = updated;
  await writeMatches(nextMatches);
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const payload = await request.json();
  if (typeof payload?.id !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const matches = await readMatches();
  const nextMatches = matches.filter((item) => item.id !== payload.id);
  if (nextMatches.length === matches.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await writeMatches(nextMatches);
  return NextResponse.json({ ok: true });
}
