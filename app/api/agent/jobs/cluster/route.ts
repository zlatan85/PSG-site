import { NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/agent/security';
import { clusterIngestItems } from '@/lib/agent/cluster';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const result = await clusterIngestItems();
  return NextResponse.json({ result });
}
