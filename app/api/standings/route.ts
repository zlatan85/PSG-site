import { NextResponse } from 'next/server';
import { defaultStandings, readStandings, writeStandings } from '../../../lib/standings-store';
import { fetchFootballDataStandings } from '../../../lib/football-data';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeRows = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((row) => typeof row === 'object' && row !== null)
    .map((row: Record<string, unknown>, index: number) => ({
      pos: toNumber(row.pos || index + 1),
      club: isNonEmptyString(row.club) ? row.club.trim() : 'Club',
      pts: toNumber(row.pts),
      j: toNumber(row.j),
      g: toNumber(row.g),
      n: toNumber(row.n),
      p: toNumber(row.p),
      diff: isNonEmptyString(row.diff) ? row.diff.trim() : '+0',
    }));
};

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const source = new URL(request.url).searchParams.get('source');
  if (source !== 'manual') {
    const [ligue1, championsLeague] = await Promise.all([
      fetchFootballDataStandings('FL1'),
      fetchFootballDataStandings('CL'),
    ]);
    if (ligue1 && championsLeague) {
      return NextResponse.json({ ligue1, championsLeague });
    }
  }

  const standings = await readStandings();
  return NextResponse.json(standings ?? defaultStandings);
}

export async function PUT(request: Request) {
  const source = new URL(request.url).searchParams.get('source');
  if (source !== 'manual') {
    return NextResponse.json({ error: 'Manual source required' }, { status: 403 });
  }
  const payload = await request.json();
  const base = { ...defaultStandings };

  const nextStandings = {
    ligue1: normalizeRows(payload?.ligue1 ?? base.ligue1),
    championsLeague: normalizeRows(payload?.championsLeague ?? base.championsLeague),
  };

  await writeStandings(nextStandings);
  return NextResponse.json(nextStandings);
}
