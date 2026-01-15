import { prisma } from './db';

export interface HomeSettings {
  heroLabel: string;
  heroTitle: string;
  heroExcerpt: string;
  heroImage: string;
  heroPrimaryLabel: string;
  heroPrimaryHref: string;
  heroSecondaryLabel: string;
  heroSecondaryHref: string;
  matchdayTitle: string;
  matchdaySubtitle: string;
  fanZoneTitle: string;
  fanZoneSubtitle: string;
  alertsTitle: string;
  alertsSubtitle: string;
  supporterHubTitle: string;
  supporterHubSubtitle: string;
  spotlightLabel: string;
}

export const defaultHomeSettings: HomeSettings = {
  heroLabel: 'La une du jour',
  heroTitle: 'PSG Newsroom',
  heroExcerpt: 'Toutes les actus, les moments forts et les insights pour vivre Paris a fond.',
  heroImage: '/api/placeholder/1600/900',
  heroPrimaryLabel: "Lire l'article",
  heroPrimaryHref: '/news',
  heroSecondaryLabel: 'Toutes les actus',
  heroSecondaryHref: '/news',
  matchdayTitle: 'Matchday Spotlight',
  matchdaySubtitle: 'Suis le live, la fan zone et les moments forts du match.',
  fanZoneTitle: 'Le coeur du supporter',
  fanZoneSubtitle: 'Mur des supporters, pronostics, highlights et challenges.',
  alertsTitle: 'Alertes Matchday',
  alertsSubtitle: 'Recois les moments forts, la compo officielle et les buts en temps reel.',
  supporterHubTitle: 'Supporter Hub',
  supporterHubSubtitle: "Tout ce qu'il faut pour vivre PSG a fond.",
  spotlightLabel: 'Player Spotlight',
};

export async function readHomeSettings(): Promise<HomeSettings | null> {
  const record = await prisma.homeSettings.findFirst();
  if (!record) return null;
  return record.payload as unknown as HomeSettings;
}

export async function writeHomeSettings(settings: HomeSettings): Promise<void> {
  const existing = await prisma.homeSettings.findFirst();
  if (existing) {
    await prisma.homeSettings.update({
      where: { id: existing.id },
      data: { payload: settings },
    });
    return;
  }
  await prisma.homeSettings.create({ data: { payload: settings } });
}
