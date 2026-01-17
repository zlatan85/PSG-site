import { prisma } from './db';

export interface ChallengeEntry {
  id: number;
  name: string;
  handle: string;
  caption: string;
  mediaUrl: string;
  mediaType: string;
  approved: boolean;
  createdAt: string;
}

export async function readChallenges(): Promise<ChallengeEntry[]> {
  const items = await prisma.fanChallenge.findMany({ orderBy: { createdAt: 'desc' } });
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    handle: item.handle ?? '',
    caption: item.caption ?? '',
    mediaUrl: item.mediaUrl,
    mediaType: item.mediaType,
    approved: item.approved,
    createdAt: item.createdAt.toISOString(),
  }));
}

export async function writeChallenges(items: ChallengeEntry[]): Promise<void> {
  await prisma.fanChallenge.deleteMany();
  if (items.length > 0) {
    await prisma.fanChallenge.createMany({
      data: items.map((item) => ({
        id: item.id,
        name: item.name,
        handle: item.handle || null,
        caption: item.caption || null,
        mediaUrl: item.mediaUrl,
        mediaType: item.mediaType,
        approved: item.approved,
        createdAt: new Date(item.createdAt),
      })),
    });
  }
}
