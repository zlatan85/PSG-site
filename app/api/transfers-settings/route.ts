import { NextResponse } from 'next/server';
import {
  defaultTransfersSettings,
  readTransfersSettings,
  writeTransfersSettings,
} from '../../../lib/transfers-settings-store';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const toString = (value: unknown, fallback: string) =>
  isNonEmptyString(value) ? value.trim() : fallback;

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await readTransfersSettings();
  return NextResponse.json(settings ?? defaultTransfersSettings);
}

export async function PUT(request: Request) {
  const payload = await request.json();
  const base = { ...defaultTransfersSettings };

  const badges = Array.isArray(payload?.badges)
    ? payload.badges.filter(isNonEmptyString).map((item: string) => item.trim()).slice(0, 3)
    : base.badges;
  while (badges.length < 3) {
    badges.push(base.badges[badges.length] ?? `Badge ${badges.length + 1}`);
  }

  const transfers = Array.isArray(payload?.transfers)
    ? payload.transfers
        .filter((item: unknown) => typeof item === 'object' && item !== null)
        .map((item: Record<string, unknown>, index: number) => ({
          id: typeof item.id === 'number' ? item.id : index + 1,
          type: item.type === 'outgoing' ? 'outgoing' : 'incoming',
          player: toString(item.player, 'Joueur'),
          from: toString(item.from, 'Club'),
          to: toString(item.to, 'PSG'),
          fee: toString(item.fee, '-'),
          date: toString(item.date, '2026-01-01'),
          position: toString(item.position, 'Position'),
          nationality: toString(item.nationality, 'Pays'),
        }))
    : base.transfers;

  const upcomingTransfers = Array.isArray(payload?.upcomingTransfers)
    ? payload.upcomingTransfers
        .filter((item: unknown) => typeof item === 'object' && item !== null)
        .map((item: Record<string, unknown>) => ({
          player: toString(item.player, 'Joueur'),
          position: toString(item.position, 'Poste'),
          currentClub: toString(item.currentClub, 'Club'),
          interest: item.interest === 'Low' ? 'Low' : item.interest === 'Medium' ? 'Medium' : 'High',
          status: toString(item.status, 'Monitoring'),
        }))
    : base.upcomingTransfers;

  const nextSettings = {
    heroTitle: toString(payload?.heroTitle, base.heroTitle),
    heroSubtitle: toString(payload?.heroSubtitle, base.heroSubtitle),
    badges,
    marketIndexTitle: toString(payload?.marketIndexTitle, base.marketIndexTitle),
    marketIndexText: toString(payload?.marketIndexText, base.marketIndexText),
    summary: {
      arrivals: toString(payload?.summary?.arrivals, base.summary.arrivals),
      departures: toString(payload?.summary?.departures, base.summary.departures),
      netSpend: toString(payload?.summary?.netSpend, base.summary.netSpend),
    },
    transfers,
    upcomingTransfers,
  };

  await writeTransfersSettings(nextSettings);
  return NextResponse.json(nextSettings);
}
