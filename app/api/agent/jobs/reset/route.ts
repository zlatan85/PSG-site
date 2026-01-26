import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdminToken } from '@/lib/agent/security';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  await prisma.clusterItem.deleteMany();
  await prisma.generatedContent.deleteMany();
  await prisma.generatedArticle.deleteMany();
  await prisma.cluster.deleteMany();
  await prisma.ingestItem.deleteMany();
  await prisma.source.deleteMany();

  return NextResponse.json({ ok: true });
}
