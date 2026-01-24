import { Prisma } from '@prisma/client';
import { prisma } from './db';

export interface LiveOverrides {
  status: 'live' | 'upcoming' | 'finished';
  minute: number;
  period: string;
  competition: string;
  stadium: string;
  referee: string;
  kickoff: string;
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  formation: string;
  startersHome: string[];
  startersHomeDetails?: { name: string; image?: string }[];
  benchHome: string[];
}

export const defaultLiveOverrides: LiveOverrides = {
  status: 'live',
  minute: 0,
  period: '1H',
  competition: '',
  stadium: '',
  referee: '',
  kickoff: '',
  homeName: 'PSG',
  awayName: '',
  homeScore: 0,
  awayScore: 0,
  formation: '4-3-3',
  startersHome: [],
  startersHomeDetails: [],
  benchHome: [],
};

export async function readLiveOverrides(): Promise<LiveOverrides | null> {
  const record = await prisma.liveOverrides.findFirst();
  if (!record) return null;
  return record.payload as unknown as LiveOverrides;
}

export async function writeLiveOverrides(payload: LiveOverrides): Promise<void> {
  const data = payload as unknown as Prisma.InputJsonValue;
  const existing = await prisma.liveOverrides.findFirst();
  if (existing) {
    await prisma.liveOverrides.update({
      where: { id: existing.id },
      data: { payload: data },
    });
    return;
  }
  await prisma.liveOverrides.create({ data: { payload: data } });
}
