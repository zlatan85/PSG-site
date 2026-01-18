import { NextRequest, NextResponse } from 'next/server';
import { readPredictions, writePredictions } from '../../../../lib/predictions-store';
import { getClientFingerprint, isRateLimited } from '../../../../lib/rate-limit';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const predictions = await readPredictions();
  const showAll = request.nextUrl.searchParams.get('all') === '1';
  const visible = showAll ? predictions : predictions.filter((item) => item.approved);
  return NextResponse.json(visible);
}

export async function POST(request: NextRequest) {
  const clientKey = `predictions:${getClientFingerprint(request.headers)}`;
  if (isRateLimited(clientKey, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const payload = await request.json();
  if (!isNonEmptyString(payload?.name)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const predictions = await readPredictions();
  const nextId = predictions.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
  const newPrediction = {
    id: nextId,
    name: payload.name.trim(),
    handle: isNonEmptyString(payload.handle) ? payload.handle.trim() : '',
    homeScore: toNumber(payload.homeScore),
    awayScore: toNumber(payload.awayScore),
    approved: false,
    createdAt: new Date().toISOString(),
  };

  await writePredictions([newPrediction, ...predictions]);
  return NextResponse.json(newPrediction, { status: 201 });
}

export async function PUT(request: Request) {
  const payload = await request.json();
  if (!Array.isArray(payload?.predictions)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const nextPredictions = payload.predictions
    .filter((item: unknown) => typeof item === 'object' && item !== null)
    .map((item: Record<string, unknown>, index: number) => ({
      id: typeof item.id === 'number' ? item.id : index + 1,
      name: isNonEmptyString(item.name) ? item.name.trim() : 'Supporter',
      handle: isNonEmptyString(item.handle) ? item.handle.trim() : '',
      homeScore: toNumber(item.homeScore),
      awayScore: toNumber(item.awayScore),
      approved: typeof item.approved === 'boolean' ? item.approved : false,
      createdAt: isNonEmptyString(item.createdAt) ? item.createdAt : new Date().toISOString(),
    }));

  await writePredictions(nextPredictions);
  return NextResponse.json(nextPredictions);
}
