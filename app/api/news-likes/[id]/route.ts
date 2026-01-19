import { NextRequest, NextResponse } from 'next/server';
import { getClientFingerprint, isRateLimited } from '../../../../lib/rate-limit';
import { incrementNewsLikes, readNewsLikes } from '../../../../lib/news-likes-store';

export const dynamic = 'force-dynamic';

const parseArticleId = (raw: string | undefined) => {
  const value = raw?.trim() ?? '';
  const match = value.match(/\d+/);
  const parsed = match ? Number(match[0]) : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export async function GET(_: NextRequest, context: { params: { id?: string } }) {
  const articleId = parseArticleId(context.params.id);
  if (!articleId) {
    return NextResponse.json({ error: 'Invalid article id' }, { status: 400 });
  }
  const count = await readNewsLikes(articleId);
  return NextResponse.json({ count });
}

export async function POST(request: NextRequest, context: { params: { id?: string } }) {
  const articleId = parseArticleId(context.params.id);
  if (!articleId) {
    return NextResponse.json({ error: 'Invalid article id' }, { status: 400 });
  }

  const clientKey = `news-like:${articleId}:${getClientFingerprint(request.headers)}`;
  if (isRateLimited(clientKey, 10_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const count = await incrementNewsLikes(articleId);
  return NextResponse.json({ count });
}
