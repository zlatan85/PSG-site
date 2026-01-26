import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdminToken } from '@/lib/agent/security';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const resolved = await params;
  const idMatch = resolved.id.match(/\d+/);
  const clusterId = idMatch ? Number(idMatch[0]) : NaN;
  if (!Number.isFinite(clusterId)) {
    return NextResponse.json({ error: 'Invalid cluster id' }, { status: 400 });
  }

  const cluster = await prisma.cluster.findUnique({
    where: { id: clusterId },
    include: {
      items: { include: { item: { include: { source: true } } } },
      contents: true,
      drafts: true,
    },
  });

  if (!cluster) {
    return NextResponse.json({ error: 'Cluster not found' }, { status: 404 });
  }

  return NextResponse.json({ cluster });
}
