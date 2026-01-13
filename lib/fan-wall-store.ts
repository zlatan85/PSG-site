import { prisma } from './db';

export interface FanWallPost {
  id: number;
  name: string;
  handle: string;
  message: string;
  time: string;
  approved: boolean;
}

export async function readFanWall(): Promise<FanWallPost[]> {
  const posts = await prisma.fanWallPost.findMany();
  return posts.map((post) => ({
    id: post.id,
    name: post.name,
    handle: post.handle ?? '',
    message: post.message,
    time: post.time ?? '',
    approved: post.approved,
  }));
}

export async function writeFanWall(posts: FanWallPost[]): Promise<void> {
  await prisma.fanWallPost.deleteMany();
  if (posts.length > 0) {
    await prisma.fanWallPost.createMany({
      data: posts.map((post) => ({
        id: post.id,
        name: post.name,
        handle: post.handle || null,
        message: post.message,
        time: post.time || null,
        approved: post.approved,
      })),
    });
  }
}
