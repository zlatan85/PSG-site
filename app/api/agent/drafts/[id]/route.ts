import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdminToken } from '@/lib/agent/security';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const resolved = await params;
  const idMatch = resolved.id.match(/\d+/);
  const draftId = idMatch ? Number(idMatch[0]) : NaN;
  if (!Number.isFinite(draftId)) {
    return NextResponse.json({ error: 'Invalid draft id' }, { status: 400 });
  }

  const draft = await prisma.generatedArticle.findUnique({ where: { id: draftId } });
  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  return NextResponse.json({ draft });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const resolved = await params;
  const idMatch = resolved.id.match(/\d+/);
  const draftId = idMatch ? Number(idMatch[0]) : NaN;
  if (!Number.isFinite(draftId)) {
    return NextResponse.json({ error: 'Invalid draft id' }, { status: 400 });
  }

  const payload = (await request.json().catch(() => null)) as {
    title?: string;
    excerpt?: string;
    content?: string;
    imageUrl?: string | null;
  } | null;

  if (!payload) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const draft = await prisma.generatedArticle.update({
    where: { id: draftId },
    data: {
      title: payload.title?.trim() || undefined,
      excerpt: payload.excerpt?.trim() || undefined,
      content: payload.content?.trim() || undefined,
      imageUrl: payload.imageUrl?.trim() || null,
    },
  });

  return NextResponse.json({ draft });
}
