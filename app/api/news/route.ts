import { NextResponse } from 'next/server';
import { readNews, writeNews } from '../../../lib/news-store';

export const dynamic = 'force-dynamic';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export async function GET() {
  const news = await readNews();
  return NextResponse.json(news);
}

export async function POST(request: Request) {
  const payload = await request.json();
  if (!isNonEmptyString(payload?.title) || !isNonEmptyString(payload?.excerpt) || !isNonEmptyString(payload?.date)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const news = await readNews();
  const nextId = news.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
  const newItem = {
    id: nextId,
    title: payload.title.trim(),
    excerpt: payload.excerpt.trim(),
    content: isNonEmptyString(payload.content) ? payload.content.trim() : payload.excerpt.trim(),
    image: isNonEmptyString(payload.image) ? payload.image.trim() : '/api/placeholder/600/400',
    date: payload.date.trim(),
  };

  await writeNews([...news, newItem]);
  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(request: Request) {
  const payload = await request.json();
  if (typeof payload?.id !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const news = await readNews();
  const index = news.findIndex((item) => item.id === payload.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const updated = {
    ...news[index],
    title: isNonEmptyString(payload.title) ? payload.title.trim() : news[index].title,
    excerpt: isNonEmptyString(payload.excerpt) ? payload.excerpt.trim() : news[index].excerpt,
    content: isNonEmptyString(payload.content) ? payload.content.trim() : news[index].content ?? news[index].excerpt,
    image: isNonEmptyString(payload.image) ? payload.image.trim() : news[index].image,
    date: isNonEmptyString(payload.date) ? payload.date.trim() : news[index].date,
  };

  const nextNews = [...news];
  nextNews[index] = updated;
  await writeNews(nextNews);
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const payload = await request.json();
  if (typeof payload?.id !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const news = await readNews();
  const nextNews = news.filter((item) => item.id !== payload.id);
  if (nextNews.length === news.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await writeNews(nextNews);
  return NextResponse.json({ ok: true });
}
