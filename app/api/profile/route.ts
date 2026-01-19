import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { getUserFromToken } from '../../../lib/auth-store';

export const dynamic = 'force-dynamic';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const trimOrNull = (value: unknown) => (isNonEmptyString(value) ? value.trim() : null);

export async function GET(request: NextRequest) {
  const token = request.cookies.get('psg_session')?.value ?? null;
  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified !== false,
      createdAt: user.createdAt,
    },
    profile: profile
      ? {
          handle: profile.handle ?? '',
          bio: profile.bio ?? '',
          favoritePlayer: profile.favoritePlayer ?? '',
          location: profile.location ?? '',
          avatarUrl: profile.avatarUrl ?? '',
          bannerUrl: profile.bannerUrl ?? '',
        }
      : null,
  });
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get('psg_session')?.value ?? null;
  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const nextName = trimOrNull(payload?.name) ?? user.name;
  const nextProfile = {
    handle: trimOrNull(payload?.handle),
    bio: trimOrNull(payload?.bio),
    favoritePlayer: trimOrNull(payload?.favoritePlayer),
    location: trimOrNull(payload?.location),
    avatarUrl: trimOrNull(payload?.avatarUrl),
    bannerUrl: trimOrNull(payload?.bannerUrl),
  };

  await prisma.user.update({
    where: { id: user.id },
    data: { name: nextName },
  });

  const profile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: nextProfile,
    create: { userId: user.id, ...nextProfile },
  });

  return NextResponse.json({
    user: {
      id: user.id,
      name: nextName,
      email: user.email,
      emailVerified: user.emailVerified !== false,
      createdAt: user.createdAt,
    },
    profile: {
      handle: profile.handle ?? '',
      bio: profile.bio ?? '',
      favoritePlayer: profile.favoritePlayer ?? '',
      location: profile.location ?? '',
      avatarUrl: profile.avatarUrl ?? '',
      bannerUrl: profile.bannerUrl ?? '',
    },
  });
}
