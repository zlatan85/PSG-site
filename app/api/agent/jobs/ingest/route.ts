import { NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/agent/security';
import { ingestSources } from '@/lib/agent/ingest';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const results = await ingestSources();
  return NextResponse.json({ results });
}
