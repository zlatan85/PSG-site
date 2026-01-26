import { NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/agent/security';
import { generateBriefForCluster } from '@/lib/agent/generate';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const resolved = await params;
  const idMatch = resolved.id.match(/\d+/);
  const clusterId = idMatch ? Number(idMatch[0]) : NaN;
  if (!Number.isFinite(clusterId)) {
    return NextResponse.json({ error: 'Invalid cluster id' }, { status: 400 });
  }

  const content = await generateBriefForCluster(clusterId);
  return NextResponse.json({ content });
}
