import { Prisma } from '@prisma/client';
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
  matchdayStatusLabel: string;
  matchdayCompetition: string;
  matchdayHomeTeam: string;
  matchdayAwayTeam: string;
  matchdayScore: string;
  matchdayDate: string;
  matchdayTime: string;
  matchdayStadium: string;
  fanZoneTitle: string;
  fanZoneSubtitle: string;
  alertsTitle: string;
  alertsSubtitle: string;
  supporterHubTitle: string;
  supporterHubSubtitle: string;
  spotlightLabel: string;
  spotlightName: string;
  spotlightText: string;
  spotlightImage: string;
}

export const defaultHomeSettings: HomeSettings = {
  heroLabel: 'La une du jour',
  heroTitle: 'ULTEAM PSG-X',
  heroExcerpt: 'Toutes les actus, les moments forts et les insights pour vivre Paris a fond.',
  heroImage: '/api/placeholder/1600/900',
  heroPrimaryLabel: "Lire l'article",
  heroPrimaryHref: '/news',
  heroSecondaryLabel: 'Toutes les actus',
  heroSecondaryHref: '/news',
  matchdayTitle: 'Focus match',
  matchdaySubtitle: 'Suis le direct, la zone supporters et les moments forts du match.',
  matchdayStatusLabel: '',
  matchdayCompetition: '',
  matchdayHomeTeam: '',
  matchdayAwayTeam: '',
  matchdayScore: '',
  matchdayDate: '',
  matchdayTime: '',
  matchdayStadium: '',
  fanZoneTitle: 'Le coeur des supporters',
  fanZoneSubtitle: 'Mur des supporters, pronostics, temps forts et defis.',
  alertsTitle: 'Alertes match',
  alertsSubtitle: 'Recois les moments forts, la compo officielle et les buts en temps reel.',
  supporterHubTitle: 'Espace supporters',
  supporterHubSubtitle: "Tout ce qu'il faut pour vivre PSG a fond.",
  spotlightLabel: 'Joueur a la une',
  spotlightName: '',
  spotlightText: '',
  spotlightImage: '',
};

export async function readHomeSettings(): Promise<HomeSettings | null> {
  const record = await prisma.homeSettings.findFirst();
  if (!record) return null;
  return record.payload as unknown as HomeSettings;
}

export async function writeHomeSettings(settings: HomeSettings): Promise<void> {
  const payload = settings as unknown as Prisma.InputJsonValue;
  const existing = await prisma.homeSettings.findFirst();
  if (existing) {
    await prisma.homeSettings.update({
      where: { id: existing.id },
      data: { payload },
    });
    return;
  }
  await prisma.homeSettings.create({ data: { payload } });
}
