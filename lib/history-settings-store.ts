import { Prisma } from '@prisma/client';
import { prisma } from './db';

export interface HistoryStat {
  label: string;
  value: string;
}

export interface HistoryTimelineItem {
  year: string;
  title: string;
  text: string;
}

export interface HistorySettings {
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  introTitle: string;
  introText: string;
  stats: HistoryStat[];
  timeline: HistoryTimelineItem[];
}

export const defaultHistorySettings: HistorySettings = {
  heroKicker: 'Depuis 1970',
  heroTitle: "L'ADN PSG",
  heroSubtitle: 'Un club parisien, une ambition europeenne, une histoire faite de titres et de legends.',
  introTitle: 'Temps forts',
  introText: "Des origines a l'ere moderne, PSG ne cesse d'elever ses standards.",
  stats: [
    { label: 'Ligue 1', value: '11' },
    { label: 'Coupes', value: '30+' },
    { label: 'Finales europeennes', value: '2' },
    { label: 'Legendes', value: '100%' },
  ],
  timeline: [
    {
      year: '1970',
      title: 'Foundation',
      text: 'Paris Saint-Germain Football Club is founded by merger of Stade Saint-Germain and Paris FC.',
    },
    {
      year: '1972',
      title: 'First Trophy',
      text: 'PSG wins its first major trophy, the Coupe de France.',
    },
    {
      year: '1974',
      title: 'European Debut',
      text: "First appearance in European competition with UEFA Cup Winners' Cup.",
    },
    {
      year: '1982',
      title: 'Stade Parc des Princes',
      text: 'PSG moves to the iconic Parc des Princes stadium.',
    },
    {
      year: '1986',
      title: 'First League Title',
      text: 'PSG wins its first Ligue 1 championship under manager Gerard Houllier.',
    },
    {
      year: '1994-1996',
      title: 'European Breakthrough',
      text: 'PSG wins Coupe des Coupes (1996) and reaches UEFA Cup final (1997).',
    },
    {
      year: '1998',
      title: 'World Cup Glory',
      text: 'France wins World Cup with several PSG players in the squad.',
    },
    {
      year: '2000',
      title: 'Century Trophy',
      text: 'PSG wins Coupe de la Ligue, completing a domestic cup double.',
    },
    {
      year: '2011',
      title: 'Qatari Investment',
      text: 'Qatar Sports Investments acquires majority stake, beginning new era.',
    },
    {
      year: '2013',
      title: 'First Champions League Semi-Final',
      text: 'PSG reaches Champions League semi-finals for the first time.',
    },
    {
      year: '2015',
      title: 'Domestic Dominance',
      text: 'PSG wins Ligue 1, Coupe de France, and Coupe de la Ligue treble.',
    },
    {
      year: '2017',
      title: 'Galacticos Era Begins',
      text: 'Signing of Neymar Jr. marks beginning of superstar acquisitions.',
    },
    {
      year: '2018',
      title: 'Mbappe Joins',
      text: 'Kylian Mbappe signs from Monaco, becoming one of world\'s most expensive transfers.',
    },
    {
      year: '2020',
      title: 'UCL Final',
      text: 'PSG reaches its first Champions League final.',
    },
    {
      year: '2021',
      title: 'Messi Arrives',
      text: 'Lionel Messi joins PSG after leaving Barcelona, completing holy trinity with Neymar and Mbappe.',
    },
    {
      year: '2022',
      title: 'Domestic Success',
      text: 'PSG wins Ligue 1 title and reaches Champions League final again.',
    },
    {
      year: '2023',
      title: 'Continued Excellence',
      text: "PSG maintains position as France's top club with continued European ambitions.",
    },
    {
      year: '2024',
      title: 'Future Champions',
      text: 'PSG continues to build towards Champions League glory with world-class squad.',
    },
  ],
};

export async function readHistorySettings(): Promise<HistorySettings | null> {
  const record = await prisma.historySettings.findFirst();
  if (!record) return null;
  return record.payload as unknown as HistorySettings;
}

export async function writeHistorySettings(settings: HistorySettings): Promise<void> {
  const payload = settings as unknown as Prisma.InputJsonValue;
  const existing = await prisma.historySettings.findFirst();
  if (existing) {
    await prisma.historySettings.update({
      where: { id: existing.id },
      data: { payload },
    });
    return;
  }
  await prisma.historySettings.create({ data: { payload } });
}
