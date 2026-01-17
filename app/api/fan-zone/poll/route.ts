import { NextResponse } from 'next/server';
import { defaultFanZonePoll, readFanZonePoll, writeFanZonePoll } from '../../../../lib/fan-zone-poll-store';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const dynamic = 'force-dynamic';

export async function GET() {
  const poll = await readFanZonePoll();
  return NextResponse.json(poll ?? defaultFanZonePoll);
}

export async function PUT(request: Request) {
  const payload = await request.json();
  const base = { ...defaultFanZonePoll };

  const rawOptions = Array.isArray(payload?.options)
    ? payload.options
        .filter((item: unknown) => typeof item === 'object' && item !== null)
        .map((item: Record<string, unknown>, index: number) => ({
          label: isNonEmptyString(item.label) ? item.label.trim() : `Option ${index + 1}`,
          votes: Number(item.votes) || 0,
        }))
    : base.options;

  const options = rawOptions.slice(0, 3);
  while (options.length < 3) {
    const fallback = base.options[options.length] ?? { label: `Option ${options.length + 1}`, votes: 0 };
    options.push({ label: fallback.label, votes: fallback.votes });
  }

  const nextPoll = {
    question: isNonEmptyString(payload?.question) ? payload.question.trim() : base.question,
    options,
  };

  await writeFanZonePoll(nextPoll);
  return NextResponse.json(nextPoll);
}
