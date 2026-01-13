import { prisma } from './db';

export interface MatchEntry {
  id: number;
  date: string;
  time: string;
  home: string;
  away: string;
  competition: string;
  stadium: string;
  status: 'upcoming' | 'played';
  score?: string;
  result?: 'W' | 'D' | 'L';
}

export async function readMatches(): Promise<MatchEntry[]> {
  const matches = await prisma.match.findMany();
  return matches.map((match) => ({
    id: match.id,
    date: match.date,
    time: match.time,
    home: match.home,
    away: match.away,
    competition: match.competition,
    stadium: match.stadium,
    status: match.status as MatchEntry['status'],
    score: match.score ?? undefined,
    result: match.result as MatchEntry['result'] | undefined,
  }));
}

export async function writeMatches(matches: MatchEntry[]): Promise<void> {
  await prisma.match.deleteMany();
  if (matches.length > 0) {
    await prisma.match.createMany({
      data: matches.map((match) => ({
        id: match.id,
        date: match.date,
        time: match.time,
        home: match.home,
        away: match.away,
        competition: match.competition,
        stadium: match.stadium,
        status: match.status,
        score: match.score ?? null,
        result: match.result ?? null,
      })),
    });
  }
}
