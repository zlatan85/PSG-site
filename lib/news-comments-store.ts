import { prisma } from './db';

export interface NewsCommentEntry {
  id: number;
  articleId: number;
  name: string;
  handle: string;
  message: string;
  approved: boolean;
  createdAt: string;
}

export async function readComments(articleId?: number): Promise<NewsCommentEntry[]> {
  const comments = await prisma.newsComment.findMany({
    where: articleId ? { articleId } : undefined,
    orderBy: { createdAt: 'desc' },
  });
  return comments.map((item) => ({
    id: item.id,
    articleId: item.articleId,
    name: item.name,
    handle: item.handle ?? '',
    message: item.message,
    approved: item.approved,
    createdAt: item.createdAt.toISOString(),
  }));
}

export async function writeComments(comments: NewsCommentEntry[]): Promise<void> {
  await prisma.newsComment.deleteMany();
  if (comments.length === 0) return;
  await prisma.newsComment.createMany({
    data: comments.map((item) => ({
      id: item.id,
      articleId: item.articleId,
      name: item.name,
      handle: item.handle || null,
      message: item.message,
      approved: item.approved,
      createdAt: new Date(item.createdAt),
    })),
  });
}
