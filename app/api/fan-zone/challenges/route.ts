import { NextRequest, NextResponse } from 'next/server';
import { readChallenges, writeChallenges } from '../../../../lib/challenges-store';
import { getClientFingerprint, isRateLimited } from '../../../../lib/rate-limit';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const challenges = await readChallenges();
  const showAll = request.nextUrl.searchParams.get('all') === '1';
  const visible = showAll ? challenges : challenges.filter((item) => item.approved);
  return NextResponse.json(visible);
}

export async function POST(request: NextRequest) {
  const clientKey = `challenges:${getClientFingerprint(request.headers)}`;
  if (isRateLimited(clientKey, 90_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const payload = await request.json();
  if (!isNonEmptyString(payload?.name) || !isNonEmptyString(payload?.mediaUrl)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const challenges = await readChallenges();
  const nextId = challenges.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
  const newItem = {
    id: nextId,
    name: payload.name.trim(),
    handle: isNonEmptyString(payload.handle) ? payload.handle.trim() : '',
    caption: isNonEmptyString(payload.caption) ? payload.caption.trim() : '',
    mediaUrl: payload.mediaUrl.trim(),
    mediaType: isNonEmptyString(payload.mediaType) ? payload.mediaType.trim() : 'photo',
    approved: false,
    createdAt: new Date().toISOString(),
  };

  await writeChallenges([newItem, ...challenges]);
  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(request: Request) {
  const payload = await request.json();
  if (!Array.isArray(payload?.challenges)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const nextItems = payload.challenges
    .filter((item: unknown) => typeof item === 'object' && item !== null)
    .map((item: Record<string, unknown>, index: number) => ({
      id: typeof item.id === 'number' ? item.id : index + 1,
      name: isNonEmptyString(item.name) ? item.name.trim() : 'Supporter',
      handle: isNonEmptyString(item.handle) ? item.handle.trim() : '',
      caption: isNonEmptyString(item.caption) ? item.caption.trim() : '',
      mediaUrl: isNonEmptyString(item.mediaUrl) ? item.mediaUrl.trim() : '',
      mediaType: isNonEmptyString(item.mediaType) ? item.mediaType.trim() : 'photo',
      approved: typeof item.approved === 'boolean' ? item.approved : false,
      createdAt: isNonEmptyString(item.createdAt) ? item.createdAt : new Date().toISOString(),
    }));

  await writeChallenges(nextItems);
  return NextResponse.json(nextItems);
}
