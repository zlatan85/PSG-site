import { NextResponse } from 'next/server';
import { defaultLiveOverrides, readLiveOverrides, writeLiveOverrides } from '../../../lib/live-overrides-store';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeList = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter((item) => item.length > 0);
  }
  if (typeof value === 'string') {
    return value
      .split(/\r?\n|;/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
};

const normalizeDetails = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === 'object' && item !== null)
    .map((item) => {
      const record = item as Record<string, unknown>;
      const name = isNonEmptyString(record.name) ? record.name.trim() : '';
      const image = isNonEmptyString(record.image) ? record.image.trim() : '';
      return name ? { name, image } : null;
    })
    .filter((item): item is { name: string; image?: string } => Boolean(item));
};

export const dynamic = 'force-dynamic';

export async function GET() {
  const overrides = await readLiveOverrides();
  return NextResponse.json(overrides ?? defaultLiveOverrides);
}

export async function PUT(request: Request) {
  const payload = await request.json();
  const base = { ...defaultLiveOverrides };

  const nextOverrides = {
    status: isNonEmptyString(payload?.status) ? payload.status : base.status,
    minute: toNumber(payload?.minute ?? base.minute),
    period: isNonEmptyString(payload?.period) ? payload.period.trim() : base.period,
    competition: isNonEmptyString(payload?.competition) ? payload.competition.trim() : base.competition,
    stadium: isNonEmptyString(payload?.stadium) ? payload.stadium.trim() : base.stadium,
    referee: isNonEmptyString(payload?.referee) ? payload.referee.trim() : base.referee,
    kickoff: isNonEmptyString(payload?.kickoff) ? payload.kickoff.trim() : base.kickoff,
    homeName: isNonEmptyString(payload?.homeName) ? payload.homeName.trim() : base.homeName,
    awayName: isNonEmptyString(payload?.awayName) ? payload.awayName.trim() : base.awayName,
    homeScore: toNumber(payload?.homeScore ?? base.homeScore),
    awayScore: toNumber(payload?.awayScore ?? base.awayScore),
    formation: isNonEmptyString(payload?.formation) ? payload.formation.trim() : base.formation,
    startersHome: normalizeList(payload?.startersHome ?? base.startersHome),
    startersHomeDetails: normalizeDetails(payload?.startersHomeDetails ?? base.startersHomeDetails),
    benchHome: normalizeList(payload?.benchHome ?? base.benchHome),
  };

  await writeLiveOverrides(nextOverrides);
  return NextResponse.json(nextOverrides);
}
