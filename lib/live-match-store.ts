import { prisma } from './db';
import { Prisma } from '@prisma/client';

export interface LiveMatchTeamStats {
  name: string;
  score: number;
  shots: number;
  shotsOnTarget: number;
  possession: number;
  passes: number;
  passAccuracy: number;
  fouls: number;
  corners: number;
  offsides: number;
  xg: number;
}

export interface LiveMatchEvent {
  minute: number;
  team: string;
  type: 'goal' | 'card' | 'substitution' | 'chance';
  player: string;
  detail: string;
}

export interface LiveMatchData {
  status: 'live' | 'finished' | 'upcoming';
  minute: number;
  period: string;
  competition: string;
  stadium: string;
  referee: string;
  kickoff: string;
  home: LiveMatchTeamStats;
  away: LiveMatchTeamStats;
  moment: {
    title: string;
    description: string;
  };
  events: LiveMatchEvent[];
  lineups: {
    home: string[];
    away: string[];
  };
  nextMatch: {
    opponent: string;
    date: string;
    competition: string;
    venue: string;
  };
}

export async function readLiveMatch(): Promise<LiveMatchData | null> {
  const record = await prisma.liveMatch.findUnique({ where: { id: 1 } });
  if (!record) {
    return null;
  }
  return record.payload as unknown as LiveMatchData;
}

export async function writeLiveMatch(data: LiveMatchData): Promise<void> {
  const payload = data as Prisma.InputJsonValue;
  await prisma.liveMatch.upsert({
    where: { id: 1 },
    update: { payload },
    create: { id: 1, payload },
  });
}
