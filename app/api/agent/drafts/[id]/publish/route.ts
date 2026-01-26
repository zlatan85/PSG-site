import { NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/agent/security';
import { publishDraft } from '@/lib/agent/publish';

export const dynamic = 'force-dynamic';

export async function POST(
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

  const news = await publishDraft(draftId);
  return NextResponse.json({ news });
}
