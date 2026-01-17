import { Prisma } from '@prisma/client';
import { prisma } from './db';

export interface FanZonePollOption {
  label: string;
  votes: number;
}

export interface FanZonePoll {
  question: string;
  options: FanZonePollOption[];
}

export const defaultFanZonePoll: FanZonePoll = {
  question: 'Qui est le joueur du match ?',
  options: [
    { label: 'K. Mbappe', votes: 0 },
    { label: 'O. Dembele', votes: 0 },
    { label: 'Vitinha', votes: 0 },
  ],
};

export async function readFanZonePoll(): Promise<FanZonePoll | null> {
  const record = await prisma.fanZonePoll.findFirst();
  if (!record) return null;
  return record.payload as unknown as FanZonePoll;
}

export async function writeFanZonePoll(payload: FanZonePoll): Promise<void> {
  const data = payload as unknown as Prisma.InputJsonValue;
  const existing = await prisma.fanZonePoll.findFirst();
  if (existing) {
    await prisma.fanZonePoll.update({
      where: { id: existing.id },
      data: { payload: data },
    });
    return;
  }
  await prisma.fanZonePoll.create({ data: { payload: data } });
}
