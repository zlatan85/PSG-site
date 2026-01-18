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
      title: 'Fondation',
      text: 'Le Paris Saint-Germain est fonde par la fusion du Stade Saint-Germain et du Paris FC.',
    },
    {
      year: '1972',
      title: 'Premier trophee',
      text: 'Le PSG remporte son premier grand trophee: la Coupe de France.',
    },
    {
      year: '1974',
      title: 'Debut europeen',
      text: 'Premiere participation europeenne en Coupe des vainqueurs de coupe.',
    },
    {
      year: '1982',
      title: 'Stade Parc des Princes',
      text: 'Le PSG s installe au Parc des Princes.',
    },
    {
      year: '1986',
      title: 'Premier titre de Ligue 1',
      text: 'Le PSG remporte son premier championnat sous Gerard Houllier.',
    },
    {
      year: '1994-1996',
      title: 'Eclosion europeenne',
      text: 'Le PSG remporte la Coupe des coupes (1996) et atteint la finale de la Coupe UEFA (1997).',
    },
    {
      year: '1998',
      title: 'Sacres mondial',
      text: 'La France gagne la Coupe du monde avec plusieurs joueurs du PSG.',
    },
    {
      year: '2000',
      title: 'Trophees nationaux',
      text: 'Le PSG gagne la Coupe de la Ligue et realise un double en coupes nationales.',
    },
    {
      year: '2011',
      title: 'Arrivee du QSI',
      text: 'Qatar Sports Investments rachete le club et lance une nouvelle ere.',
    },
    {
      year: '2013',
      title: 'Demi-finale de C1',
      text: 'Le PSG atteint les demi-finales de Ligue des champions pour la premiere fois.',
    },
    {
      year: '2015',
      title: 'Domination nationale',
      text: 'Le PSG remporte le trio Ligue 1, Coupe de France et Coupe de la Ligue.',
    },
    {
      year: '2017',
      title: 'Ere des stars',
      text: "L'arrivee de Neymar marque un tournant dans les recrutements.",
    },
    {
      year: '2018',
      title: 'Arrivee de Mbappe',
      text: 'Kylian Mbappe arrive de Monaco et devient l un des transferts les plus chers.',
    },
    {
      year: '2020',
      title: 'Finale de C1',
      text: 'Le PSG dispute sa premiere finale de Ligue des champions.',
    },
    {
      year: '2021',
      title: 'Messi a Paris',
      text: 'Lionel Messi rejoint le PSG et complete le trio avec Neymar et Mbappe.',
    },
    {
      year: '2022',
      title: 'Succes national',
      text: 'Le PSG gagne la Ligue 1 et reste ambitieux en Ligue des champions.',
    },
    {
      year: '2023',
      title: 'Ambition continue',
      text: 'Le PSG reste le leader en France avec des ambitions europeennes.',
    },
    {
      year: '2024',
      title: 'Objectif Europe',
      text: 'Le PSG construit un effectif de haut niveau pour viser l Europe.',
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
