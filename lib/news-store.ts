import { prisma } from './db';

export interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  content?: string;
}

export async function readNews(): Promise<NewsArticle[]> {
  const news = await prisma.newsArticle.findMany();
  return news.map((item) => ({
    id: item.id,
    title: item.title,
    excerpt: item.excerpt,
    image: item.image,
    date: item.date,
    content: item.content ?? undefined,
  }));
}

export async function readNewsById(id: number): Promise<NewsArticle | null> {
  const item = await prisma.newsArticle.findUnique({ where: { id } });
  if (!item) return null;
  return {
    id: item.id,
    title: item.title,
    excerpt: item.excerpt,
    image: item.image,
    date: item.date,
    content: item.content ?? undefined,
  };
}

export async function writeNews(news: NewsArticle[]): Promise<void> {
  await prisma.newsArticle.deleteMany();
  if (news.length > 0) {
    await prisma.newsArticle.createMany({
      data: news.map((item) => ({
        id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        content: item.content ?? null,
        image: item.image,
        date: item.date,
      })),
    });
  }
}
