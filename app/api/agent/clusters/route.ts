import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdminToken } from '@/lib/agent/security';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const url = new URL(request.url);
  const status = url.searchParams.get('status');

  const clusters = await prisma.cluster.findMany({
    where: status ? { status } : undefined,
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: { select: { items: true, drafts: true, contents: true } },
    },
  });

  return NextResponse.json({ clusters });
}
