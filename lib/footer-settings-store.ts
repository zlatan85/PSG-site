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
  brandTitle: 'PSG News',
  brandText: 'Le hub des supporters: actus, live, fan zone et moments forts du PSG.',
  alertsTitle: 'Matchday Alertes',
  alertsText: 'Recois les moments chauds du match et les annonces officielles.',
  alertsCtaLabel: "M'alerter",
  bottomText: '© 2026 PSG News. Tous droits reserves.',
};

export async function readFooterSettings(): Promise<FooterSettings | null> {
  const record = await prisma.footerSettings.findFirst();
  if (!record) return null;
  return record.payload as unknown as FooterSettings;
}

export async function writeFooterSettings(settings: FooterSettings): Promise<void> {
  const existing = await prisma.footerSettings.findFirst();
  if (existing) {
    await prisma.footerSettings.update({
      where: { id: existing.id },
      data: { payload: settings },
    });
    return;
  }
  await prisma.footerSettings.create({ data: { payload: settings } });
}
