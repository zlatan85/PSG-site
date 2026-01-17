import { NextResponse } from 'next/server';
import { defaultTopStats, readTopStats, writeTopStats } from '../../../lib/top-stats-store';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeScorers = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((row) => typeof row === 'object' && row !== null)
    .map((row: Record<string, unknown>, index: number) => ({
      pos: toNumber(row.pos || index + 1),
      player: isNonEmptyString(row.player) ? row.player.trim() : 'Joueur',
      club: isNonEmptyString(row.club) ? row.club.trim() : 'Club',
      goals: toNumber(row.goals),
    }));
};

const normalizeAssists = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((row) => typeof row === 'object' && row !== null)
    .map((row: Record<string, unknown>, index: number) => ({
      pos: toNumber(row.pos || index + 1),
      player: isNonEmptyString(row.player) ? row.player.trim() : 'Joueur',
      club: isNonEmptyString(row.club) ? row.club.trim() : 'Club',
      assists: toNumber(row.assists),
    }));
};

export const dynamic = 'force-dynamic';

export async function GET() {
  const stats = await readTopStats();
  return NextResponse.json(stats ?? defaultTopStats);
}

export async function PUT(request: Request) {
  const payload = await request.json();
  const base = { ...defaultTopStats };

  const nextStats = {
    scorers: normalizeScorers(payload?.scorers ?? base.scorers),
    assists: normalizeAssists(payload?.assists ?? base.assists),
  };

  await writeTopStats(nextStats);
  return NextResponse.json(nextStats);
}
