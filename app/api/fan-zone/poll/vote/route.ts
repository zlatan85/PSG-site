import { NextRequest, NextResponse } from 'next/server';
import { defaultFanZonePoll, readFanZonePoll, writeFanZonePoll } from '../../../../../lib/fan-zone-poll-store';
import { getClientFingerprint, isRateLimited } from '../../../../../lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const clientKey = `poll-vote:${getClientFingerprint(request.headers)}`;
  if (isRateLimited(clientKey, 30_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const payload = await request.json();
  const index = Number(payload?.index);
  if (!Number.isFinite(index)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const poll = (await readFanZonePoll()) ?? defaultFanZonePoll;
  if (!poll.options[index]) {
    return NextResponse.json({ error: 'Option not found' }, { status: 404 });
  }

  const nextPoll = {
    ...poll,
    options: poll.options.map((option, optionIndex) =>
      optionIndex === index ? { ...option, votes: option.votes + 1 } : option
    ),
  };

  await writeFanZonePoll(nextPoll);
  return NextResponse.json(nextPoll);
}
