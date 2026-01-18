import { Prisma } from '@prisma/client';
import { prisma } from './db';

export interface FooterSettings {
  brandTitle: string;
  brandText: string;
  alertsTitle: string;
  alertsText: string;
  alertsCtaLabel: string;
  bottomText: string;
}

export const defaultFooterSettings: FooterSettings = {
  brandTitle: 'ULTEAM PSG-X',
  brandText: 'Le hub des supporters: actus, live, zone supporters et moments forts du PSG.',
  alertsTitle: 'Alertes match',
  alertsText: 'Recois les moments chauds du match et les annonces officielles.',
  alertsCtaLabel: "M'alerter",
  bottomText: '© 2026 ULTEAM PSG-X. Tous droits reserves.',
};

export async function readFooterSettings(): Promise<FooterSettings | null> {
  const record = await prisma.footerSettings.findFirst();
  if (!record) return null;
  return record.payload as unknown as FooterSettings;
}

export async function writeFooterSettings(settings: FooterSettings): Promise<void> {
  const payload = settings as unknown as Prisma.InputJsonValue;
  const existing = await prisma.footerSettings.findFirst();
  if (existing) {
    await prisma.footerSettings.update({
      where: { id: existing.id },
      data: { payload },
    });
    return;
  }
  await prisma.footerSettings.create({ data: { payload } });
}
