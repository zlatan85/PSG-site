import { Prisma } from '@prisma/client';
import { prisma } from './db';

export interface StandingRow {
  pos: number;
  club: string;
  pts: number;
  j: number;
  g: number;
  n: number;
  p: number;
  diff: string;
}

export interface StandingsPayload {
  ligue1: StandingRow[];
  championsLeague: StandingRow[];
}

export const defaultStandings: StandingsPayload = {
  ligue1: [
    { pos: 1, club: 'PSG', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
    { pos: 2, club: 'Monaco', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
    { pos: 3, club: 'Lille', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
    { pos: 4, club: 'Marseille', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
    { pos: 5, club: 'Rennes', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
    { pos: 6, club: 'Lyon', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
  ],
  championsLeague: [
    { pos: 1, club: 'PSG', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
    { pos: 2, club: 'Dortmund', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
    { pos: 3, club: 'Milan', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
    { pos: 4, club: 'Newcastle', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
  ],
};

export async function readStandings(): Promise<StandingsPayload | null> {
  const record = await prisma.standings.findFirst();
  if (!record) return null;
  return record.payload as unknown as StandingsPayload;
}

export async function writeStandings(payload: StandingsPayload): Promise<void> {
  const data = payload as unknown as Prisma.InputJsonValue;
  const existing = await prisma.standings.findFirst();
  if (existing) {
    await prisma.standings.update({
      where: { id: existing.id },
      data: { payload: data },
    });
    return;
  }
  await prisma.standings.create({ data: { payload: data } });
}
