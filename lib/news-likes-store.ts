import { prisma } from './db';

export async function readNewsLikes(articleId: number): Promise<number> {
  const record = await prisma.newsLike.findUnique({ where: { articleId } });
  return record?.count ?? 0;
}

export async function incrementNewsLikes(articleId: number): Promise<number> {
  const record = await prisma.newsLike.upsert({
    where: { articleId },
    update: { count: { increment: 1 } },
    create: { articleId, count: 1 },
  });
  return record.count;
}
