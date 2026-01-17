import { NextResponse } from 'next/server';
import {
  defaultHistorySettings,
  readHistorySettings,
  writeHistorySettings,
} from '../../../lib/history-settings-store';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const toString = (value: unknown, fallback: string) =>
  isNonEmptyString(value) ? value.trim() : fallback;

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await readHistorySettings();
  return NextResponse.json(settings ?? defaultHistorySettings);
}

export async function PUT(request: Request) {
  const payload = await request.json();
  const base = { ...defaultHistorySettings };

  const stats = Array.isArray(payload?.stats)
    ? payload.stats
        .filter((item: unknown) => typeof item === 'object' && item !== null)
        .map((item: Record<string, unknown>, index: number) => ({
          label: toString(item.label, `Stat ${index + 1}`),
          value: toString(item.value, '-'),
        }))
    : base.stats;

  const timeline = Array.isArray(payload?.timeline)
    ? payload.timeline
        .filter((item: unknown) => typeof item === 'object' && item !== null)
        .map((item: Record<string, unknown>, index: number) => ({
          year: toString(item.year, String(1970 + index)),
          title: toString(item.title, 'Titre'),
          text: toString(item.text, ''),
        }))
    : base.timeline;

  const nextSettings = {
    heroKicker: toString(payload?.heroKicker, base.heroKicker),
    heroTitle: toString(payload?.heroTitle, base.heroTitle),
    heroSubtitle: toString(payload?.heroSubtitle, base.heroSubtitle),
    introTitle: toString(payload?.introTitle, base.introTitle),
    introText: toString(payload?.introText, base.introText),
    stats,
    timeline,
  };

  await writeHistorySettings(nextSettings);
  return NextResponse.json(nextSettings);
}
