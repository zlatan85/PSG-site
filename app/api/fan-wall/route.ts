import { NextRequest, NextResponse } from 'next/server';
import { readFanWall, writeFanWall } from '../../../lib/fan-wall-store';
import { getUserFromToken } from '../../../lib/auth-store';

export const dynamic = 'force-dynamic';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export async function GET(request: NextRequest) {
  const posts = await readFanWall();
  const showAll = request.nextUrl.searchParams.get('all') === '1';
  const visiblePosts = showAll ? posts : posts.filter((post) => post.approved);
  return NextResponse.json(visiblePosts);
}

export async function PUT(request: Request) {
  const payload = await request.json();
  if (!Array.isArray(payload?.posts)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const nextPosts = payload.posts
    .filter((post: unknown) => typeof post === 'object' && post !== null)
    .map((post: Record<string, unknown>, index: number) => ({
      id: typeof post.id === 'number' ? post.id : index + 1,
      name: isNonEmptyString(post.name) ? post.name.trim() : '',
      handle: isNonEmptyString(post.handle) ? post.handle.trim() : '',
      message: isNonEmptyString(post.message) ? post.message.trim() : '',
      time: isNonEmptyString(post.time) ? post.time.trim() : '',
      approved: typeof post.approved === 'boolean' ? post.approved : true,
    }))
    .filter((post: { name: string; message: string }) =>
      isNonEmptyString(post.name) && isNonEmptyString(post.message)
    );

  await writeFanWall(nextPosts);
  return NextResponse.json(nextPosts);
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  if (!isNonEmptyString(payload?.message)) {
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

  const posts = await readFanWall();
  const nextId = posts.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
  const newPost = {
    id: nextId,
    name: user.name,
    handle: isNonEmptyString(payload.handle) ? payload.handle.trim() : '',
    message: payload.message.trim(),
    time: isNonEmptyString(payload.time) ? payload.time.trim() : 'maintenant',
    approved: false,
  };

  const nextPosts = [...posts, newPost];
  await writeFanWall(nextPosts);
  return NextResponse.json(newPost, { status: 201 });
}
