import { Prisma } from '@prisma/client';
import { prisma } from './db';

export interface TransferEntry {
  id: number;
  type: 'incoming' | 'outgoing';
  player: string;
  from: string;
  to: string;
  fee: string;
  date: string;
  position: string;
  nationality: string;
}

export interface UpcomingTransfer {
  player: string;
  position: string;
  currentClub: string;
  interest: 'High' | 'Medium' | 'Low';
  status: string;
}

export interface TransfersSettings {
  heroTitle: string;
  heroSubtitle: string;
  badges: string[];
  marketIndexTitle: string;
  marketIndexText: string;
  summary: {
    arrivals: string;
    departures: string;
    netSpend: string;
  };
  transfers: TransferEntry[];
  upcomingTransfers: UpcomingTransfer[];
}

export const defaultTransfersSettings: TransfersSettings = {
  heroTitle: 'Mercato PSG',
  heroSubtitle: 'Arrivees, departs, rumeurs et negocations: suivez le mercato en temps reel.',
  badges: ['Live updates', 'Rumeurs fiables', 'Deals officiels'],
  marketIndexTitle: 'Indice mercato',
  marketIndexText: 'Fenetre active: concentration sur les postes offensifs et la profondeur de banc.',
  summary: {
    arrivals: '2',
    departures: '2',
    netSpend: '€104.5M',
  },
  transfers: [
    {
      id: 1,
      type: 'incoming',
      player: 'Vitinha',
      from: 'Roma',
      to: 'PSG',
      fee: '41.5M €',
      date: '2025-01-15',
      position: 'Midfielder',
      nationality: 'Portugal',
    },
    {
      id: 2,
      type: 'incoming',
      player: 'Carlos Soler',
      from: 'Valencia',
      to: 'PSG',
      fee: '18M €',
      date: '2024-12-20',
      position: 'Midfielder',
      nationality: 'Spain',
    },
    {
      id: 3,
      type: 'outgoing',
      player: 'Hugo Ekitike',
      from: 'PSG',
      to: 'Eintracht Frankfurt',
      fee: '15M €',
      date: '2024-12-10',
      position: 'Forward',
      nationality: 'France',
    },
    {
      id: 4,
      type: 'outgoing',
      player: 'Renato Sanches',
      from: 'PSG',
      to: 'Roma',
      fee: 'Free',
      date: '2024-11-25',
      position: 'Midfielder',
      nationality: 'Portugal',
    },
    {
      id: 5,
      type: 'incoming',
      player: 'Lucas Hernandez',
      from: 'Bayern Munich',
      to: 'PSG',
      fee: '45M €',
      date: '2024-07-15',
      position: 'Defender',
      nationality: 'France',
    },
  ],
  upcomingTransfers: [
    {
      player: 'Joao Cancelo',
      position: 'Defender',
      currentClub: 'Barcelona',
      interest: 'High',
      status: 'Negotiations',
    },
    {
      player: 'Enzo Fernandez',
      position: 'Midfielder',
      currentClub: 'Chelsea',
      interest: 'Medium',
      status: 'Monitoring',
    },
    {
      player: 'Raphinha',
      position: 'Forward',
      currentClub: 'Barcelona',
      interest: 'High',
      status: 'Advanced Talks',
    },
  ],
};

export async function readTransfersSettings(): Promise<TransfersSettings | null> {
  const record = await prisma.transfersSettings.findFirst();
  if (!record) return null;
  return record.payload as unknown as TransfersSettings;
}

export async function writeTransfersSettings(settings: TransfersSettings): Promise<void> {
  const payload = settings as unknown as Prisma.InputJsonValue;
  const existing = await prisma.transfersSettings.findFirst();
  if (existing) {
    await prisma.transfersSettings.update({
      where: { id: existing.id },
      data: { payload },
    });
    return;
  }
  await prisma.transfersSettings.create({ data: { payload } });
}
