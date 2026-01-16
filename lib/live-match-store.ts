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

type ApiFootFixture = {
  fixture: {
    id: number;
    date: string;
    referee: string | null;
    venue: { name: string | null };
    status: { short: string; elapsed: number | null };
  };
  league: { name: string | null };
  teams: { home: { name: string | null }; away: { name: string | null } };
  goals: { home: number | null; away: number | null };
};

const apiCache: { timestamp: number; data: LiveMatchData | null } = {
  timestamp: 0,
  data: null,
};

const liveStatusMap = new Set(['1H', '2H', 'HT', 'ET', 'P', 'BT', 'INT', 'LIVE']);

const buildLiveMatchFromFixture = (fixture: ApiFootFixture): LiveMatchData => {
  const homeName = fixture.teams.home.name ?? 'PSG';
  const awayName = fixture.teams.away.name ?? 'Adversaire';
  const homeScore = fixture.goals.home ?? 0;
  const awayScore = fixture.goals.away ?? 0;
  return {
    status: liveStatusMap.has(fixture.fixture.status.short) ? 'live' : 'upcoming',
    minute: fixture.fixture.status.elapsed ?? 0,
    period: fixture.fixture.status.short ?? '',
    competition: fixture.league.name ?? 'Match',
    stadium: fixture.fixture.venue.name ?? 'Stade',
    referee: fixture.fixture.referee ?? 'N/A',
    kickoff: fixture.fixture.date,
    home: {
      name: homeName,
      score: homeScore,
      shots: 0,
      shotsOnTarget: 0,
      possession: 50,
      passes: 0,
      passAccuracy: 0,
      fouls: 0,
      corners: 0,
      offsides: 0,
      xg: 0,
    },
    away: {
      name: awayName,
      score: awayScore,
      shots: 0,
      shotsOnTarget: 0,
      possession: 50,
      passes: 0,
      passAccuracy: 0,
      fouls: 0,
      corners: 0,
      offsides: 0,
      xg: 0,
    },
    moment: {
      title: 'Score en direct',
      description: `${homeName} ${homeScore} - ${awayScore} ${awayName}`,
    },
    events: [],
    lineups: {
      home: [],
      away: [],
    },
    nextMatch: {
      opponent: awayName,
      date: fixture.fixture.date,
      competition: fixture.league.name ?? 'Match',
      venue: fixture.fixture.venue.name ?? 'Stade',
    },
  };
};

const fetchLiveMatchFromApi = async (): Promise<LiveMatchData | null> => {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) return null;
  if (Date.now() - apiCache.timestamp < 60_000) {
    return apiCache.data;
  }

  const teamId = process.env.API_FOOTBALL_TEAM_ID ?? '85';
  const response = await fetch(
    `https://v3.football.api-sports.io/fixtures?live=all&team=${teamId}`,
    {
      headers: {
        'x-apisports-key': apiKey,
      },
      next: { revalidate: 60 },
    }
  );

  if (!response.ok) {
    apiCache.timestamp = Date.now();
    apiCache.data = null;
    return null;
  }

  const data = (await response.json()) as { response?: ApiFootFixture[] };
  const fixture = data.response?.[0];
  if (!fixture) {
    apiCache.timestamp = Date.now();
    apiCache.data = null;
    return null;
  }

  const liveMatch = buildLiveMatchFromFixture(fixture);
  apiCache.timestamp = Date.now();
  apiCache.data = liveMatch;
  return liveMatch;
};

export async function readLiveMatch(): Promise<LiveMatchData | null> {
  const apiLive = await fetchLiveMatchFromApi();
  if (apiLive) return apiLive;
  const record = await prisma.liveMatch.findUnique({ where: { id: 1 } });
  if (!record) {
    return null;
  }
  return record.payload as unknown as LiveMatchData;
}

export async function writeLiveMatch(data: LiveMatchData): Promise<void> {
  const payload = data as unknown as Prisma.InputJsonValue;
  await prisma.liveMatch.upsert({
    where: { id: 1 },
    update: { payload },
    create: { id: 1, payload },
  });
}
