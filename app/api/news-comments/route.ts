import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '../../../lib/auth-store';
import { readComments, writeComments } from '../../../lib/news-comments-store';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const articleIdParam = request.nextUrl.searchParams.get('articleId');
  const articleId = articleIdParam ? Number(articleIdParam) : undefined;
  const showAll = request.nextUrl.searchParams.get('all') === '1';
  const comments = await readComments(articleId);
  const visible = showAll ? comments : comments.filter((item) => item.approved);
  return NextResponse.json(visible);
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  if (!isNonEmptyString(payload?.message) || !Number.isFinite(Number(payload?.articleId))) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const token = request.cookies.get('psg_session')?.value ?? null;
  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (user.emailVerified === false) {
    return NextResponse.json({ error: 'Email not verified' }, { status: 403 });
  }

  const comments = await readComments();
  const nextId = comments.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
  const newComment = {
    id: nextId,
    articleId: Number(payload.articleId),
    name: user.name,
    handle: isNonEmptyString(payload.handle) ? payload.handle.trim() : '',
    message: payload.message.trim(),
    approved: false,
    createdAt: new Date().toISOString(),
  };

  await writeComments([newComment, ...comments]);
  return NextResponse.json(newComment, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const payload = await request.json();
  if (!Array.isArray(payload?.comments)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const nextComments = payload.comments
    .filter((item: unknown) => typeof item === 'object' && item !== null)
    .map((item: Record<string, unknown>, index: number) => ({
      id: typeof item.id === 'number' ? item.id : index + 1,
      articleId: Number(item.articleId) || 0,
      name: isNonEmptyString(item.name) ? item.name.trim() : 'Supporter',
      handle: isNonEmptyString(item.handle) ? item.handle.trim() : '',
      message: isNonEmptyString(item.message) ? item.message.trim() : '',
      approved: typeof item.approved === 'boolean' ? item.approved : false,
      createdAt: isNonEmptyString(item.createdAt) ? item.createdAt : new Date().toISOString(),
    }))
    .filter(
      (
        comment: {
          id: number;
          articleId: number;
          name: string;
          handle: string;
          message: string;
          approved: boolean;
          createdAt: string;
        }
      ) =>
      comment.articleId > 0 &&
      isNonEmptyString(comment.name) &&
      isNonEmptyString(comment.message)
    );

  await writeComments(nextComments);
  return NextResponse.json(nextComments);
}
