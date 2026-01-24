import { Prisma } from '@prisma/client';
import { prisma } from './db';

export interface TopScorerRow {
  pos: number;
  player: string;
  club: string;
  goals: number;
}

export interface TopAssistRow {
  pos: number;
  player: string;
  club: string;
  assists: number;
}

export interface TopStatsPayload {
  scorers: TopScorerRow[];
  assists: TopAssistRow[];
  clScorers: TopScorerRow[];
  clAssists: TopAssistRow[];
}

export const defaultTopStats: TopStatsPayload = {
  scorers: [
    { pos: 1, player: 'K. Mbappe', club: 'PSG', goals: 0 },
    { pos: 2, player: 'O. Dembele', club: 'PSG', goals: 0 },
    { pos: 3, player: 'R. Kolo Muani', club: 'PSG', goals: 0 },
  ],
  assists: [
    { pos: 1, player: 'A. Hakimi', club: 'PSG', assists: 0 },
    { pos: 2, player: 'Vitinha', club: 'PSG', assists: 0 },
    { pos: 3, player: 'K. Mbappe', club: 'PSG', assists: 0 },
  ],
  clScorers: [
    { pos: 1, player: 'K. Mbappe', club: 'PSG', goals: 0 },
    { pos: 2, player: 'O. Dembele', club: 'PSG', goals: 0 },
    { pos: 3, player: 'R. Kolo Muani', club: 'PSG', goals: 0 },
  ],
  clAssists: [
    { pos: 1, player: 'A. Hakimi', club: 'PSG', assists: 0 },
    { pos: 2, player: 'Vitinha', club: 'PSG', assists: 0 },
    { pos: 3, player: 'K. Mbappe', club: 'PSG', assists: 0 },
  ],
};

export async function readTopStats(): Promise<TopStatsPayload | null> {
  const record = await prisma.topStats.findFirst();
  if (!record) return null;
  return record.payload as unknown as TopStatsPayload;
}

export async function writeTopStats(payload: TopStatsPayload): Promise<void> {
  const data = payload as unknown as Prisma.InputJsonValue;
  const existing = await prisma.topStats.findFirst();
  if (existing) {
    await prisma.topStats.update({
      where: { id: existing.id },
      data: { payload: data },
    });
    return;
  }
  await prisma.topStats.create({ data: { payload: data } });
}
