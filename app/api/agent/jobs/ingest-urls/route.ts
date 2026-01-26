import { NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/agent/security';
import { ingestManualUrls } from '@/lib/agent/ingest/manual';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const body = (await request.json().catch(() => null)) as { urls?: string[] } | null;
  if (!body || !Array.isArray(body.urls)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const urls = body.urls.map((url) => String(url));
  const results = await ingestManualUrls(urls);
  return NextResponse.json({ results });
}
