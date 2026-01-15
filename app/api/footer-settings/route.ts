import { NextResponse } from 'next/server';
import { defaultFooterSettings, readFooterSettings, writeFooterSettings } from '../../../lib/footer-settings-store';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await readFooterSettings();
  return NextResponse.json(settings ?? defaultFooterSettings);
}

export async function PUT(request: Request) {
  const payload = await request.json();
  const base = { ...defaultFooterSettings };

  const nextSettings = {
    brandTitle: isNonEmptyString(payload?.brandTitle) ? payload.brandTitle.trim() : base.brandTitle,
    brandText: isNonEmptyString(payload?.brandText) ? payload.brandText.trim() : base.brandText,
    alertsTitle: isNonEmptyString(payload?.alertsTitle) ? payload.alertsTitle.trim() : base.alertsTitle,
    alertsText: isNonEmptyString(payload?.alertsText) ? payload.alertsText.trim() : base.alertsText,
    alertsCtaLabel: isNonEmptyString(payload?.alertsCtaLabel) ? payload.alertsCtaLabel.trim() : base.alertsCtaLabel,
    bottomText: isNonEmptyString(payload?.bottomText) ? payload.bottomText.trim() : base.bottomText,
  };

  await writeFooterSettings(nextSettings);
  return NextResponse.json(nextSettings);
}
