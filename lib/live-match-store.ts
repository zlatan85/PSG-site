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

type ApiFootStat = {
  type: string;
  value: string | number | null;
};

type ApiFootStatsEntry = {
  team: { name: string | null };
  statistics: ApiFootStat[];
};

type ApiFootEvent = {
  time: { elapsed: number | null };
  team: { name: string | null };
  player: { name: string | null };
  type: string | null;
  detail: string | null;
};

type FootballDataMatch = {
  utcDate?: string;
  status?: string;
  competition?: { name?: string };
  homeTeam?: { name?: string };
  awayTeam?: { name?: string };
  score?: {
    fullTime?: { home?: number | null; away?: number | null };
    halfTime?: { home?: number | null; away?: number | null };
  };
  venue?: string | null;
};

const apiCache: { timestamp: number; data: LiveMatchData | null } = {
  timestamp: 0,
  data: null,
};

const liveStatusMap = new Set(['1H', '2H', 'HT', 'ET', 'P', 'BT', 'INT', 'LIVE']);
const finishedStatusMap = new Set(['FT', 'AET', 'PEN']);

const toNumber = (value: string | number | null): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace('%', '').trim();
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const pickStatsValue = (stats: ApiFootStat[] | undefined, labels: string[]) => {
  if (!stats) return 0;
  const entry = stats.find((stat) => labels.includes(stat.type));
  return entry ? toNumber(entry.value) : 0;
};

const mapEventType = (value: string | null): LiveMatchEvent['type'] => {
  switch (value) {
    case 'Goal':
      return 'goal';
    case 'Card':
      return 'card';
    case 'subst':
      return 'substitution';
    default:
      return 'chance';
  }
};

const buildLiveMatchFromFixture = (
  fixture: ApiFootFixture,
  stats: ApiFootStatsEntry[] | null,
  events: ApiFootEvent[] | null
): LiveMatchData => {
  const homeName = fixture.teams.home.name ?? 'PSG';
  const awayName = fixture.teams.away.name ?? 'Adversaire';
  const homeScore = fixture.goals.home ?? 0;
  const awayScore = fixture.goals.away ?? 0;
  const homeStats =
    stats?.find((entry) => entry.team.name === homeName) ?? stats?.[0];
  const awayStats =
    stats?.find((entry) => entry.team.name === awayName) ?? stats?.[1];
  const mappedEvents =
    events?.map((event) => ({
      minute: event.time.elapsed ?? 0,
      team: event.team.name ?? '',
      type: mapEventType(event.type),
      player: event.player.name ?? '',
      detail: event.detail ?? '',
    })) ?? [];
  const lastGoal = [...mappedEvents].reverse().find((event) => event.type === 'goal');
  const statusShort = fixture.fixture.status.short ?? '';
  return {
    status: liveStatusMap.has(statusShort)
      ? 'live'
      : finishedStatusMap.has(statusShort)
      ? 'finished'
      : 'upcoming',
    minute: fixture.fixture.status.elapsed ?? 0,
    period: statusShort,
    competition: fixture.league.name ?? 'Match',
    stadium: fixture.fixture.venue.name ?? 'Stade',
    referee: fixture.fixture.referee ?? 'N/A',
    kickoff: fixture.fixture.date,
    home: {
      name: homeName,
      score: homeScore,
      shots: pickStatsValue(homeStats?.statistics, ['Total Shots']),
      shotsOnTarget: pickStatsValue(homeStats?.statistics, ['Shots on Goal']),
      possession: pickStatsValue(homeStats?.statistics, ['Ball Possession']),
      passes: pickStatsValue(homeStats?.statistics, ['Passes']),
      passAccuracy: pickStatsValue(homeStats?.statistics, ['Passes %']),
      fouls: pickStatsValue(homeStats?.statistics, ['Fouls']),
      corners: pickStatsValue(homeStats?.statistics, ['Corner Kicks']),
      offsides: pickStatsValue(homeStats?.statistics, ['Offsides']),
      xg: pickStatsValue(homeStats?.statistics, ['Expected Goals', 'Expected Goals (xG)']),
    },
    away: {
      name: awayName,
      score: awayScore,
      shots: pickStatsValue(awayStats?.statistics, ['Total Shots']),
      shotsOnTarget: pickStatsValue(awayStats?.statistics, ['Shots on Goal']),
      possession: pickStatsValue(awayStats?.statistics, ['Ball Possession']),
      passes: pickStatsValue(awayStats?.statistics, ['Passes']),
      passAccuracy: pickStatsValue(awayStats?.statistics, ['Passes %']),
      fouls: pickStatsValue(awayStats?.statistics, ['Fouls']),
      corners: pickStatsValue(awayStats?.statistics, ['Corner Kicks']),
      offsides: pickStatsValue(awayStats?.statistics, ['Offsides']),
      xg: pickStatsValue(awayStats?.statistics, ['Expected Goals', 'Expected Goals (xG)']),
    },
    moment: {
      title: lastGoal ? `But ${lastGoal.team}` : 'Score en direct',
      description: lastGoal
        ? `${lastGoal.player} (${lastGoal.minute}')`
        : `${homeName} ${homeScore} - ${awayScore} ${awayName}`,
    },
    events: mappedEvents,
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

  const fixtureId = fixture.fixture.id;
  const [statsResponse, eventsResponse] = await Promise.all([
    fetch(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixtureId}`, {
      headers: { 'x-apisports-key': apiKey },
      next: { revalidate: 60 },
    }),
    fetch(`https://v3.football.api-sports.io/fixtures/events?fixture=${fixtureId}`, {
      headers: { 'x-apisports-key': apiKey },
      next: { revalidate: 60 },
    }),
  ]);

  const statsData = statsResponse.ok
    ? ((await statsResponse.json()) as { response?: ApiFootStatsEntry[] })
    : null;
  const eventsData = eventsResponse.ok
    ? ((await eventsResponse.json()) as { response?: ApiFootEvent[] })
    : null;

  const liveMatch = buildLiveMatchFromFixture(
    fixture,
    statsData?.response ?? null,
    eventsData?.response ?? null
  );
  apiCache.timestamp = Date.now();
  apiCache.data = liveMatch;
  return liveMatch;
};

const fetchLiveMatchFromFootballData = async (): Promise<LiveMatchData | null> => {
  const token = process.env.FOOTBALL_DATA_TOKEN || process.env.FOOTBALL_DATA_KEY;
  if (!token) return null;
  if (Date.now() - apiCache.timestamp < 60_000) {
    return apiCache.data;
  }

  const teamId = process.env.FOOTBALL_DATA_TEAM_ID ?? '524';
  const response = await fetch(
    `https://api.football-data.org/v4/teams/${teamId}/matches?status=IN_PLAY,PAUSED`,
    {
      headers: { 'X-Auth-Token': token },
      next: { revalidate: 60 },
    }
  );

  if (!response.ok) {
    apiCache.timestamp = Date.now();
    apiCache.data = null;
    return null;
  }

  const data = (await response.json()) as { matches?: FootballDataMatch[] };
  const match = data.matches?.[0];
  if (!match) {
    apiCache.timestamp = Date.now();
    apiCache.data = null;
    return null;
  }

  const kickoff = match.utcDate ?? new Date().toISOString();
  const kickoffTime = new Date(kickoff);
  const elapsed =
    Number.isFinite(kickoffTime.getTime())
      ? Math.max(0, Math.floor((Date.now() - kickoffTime.getTime()) / 60000))
      : 0;
  const statusRaw = (match.status ?? '').toUpperCase();
  const isPaused = statusRaw === 'PAUSED' || statusRaw === 'HALF_TIME';
  const homeScore =
    match.score?.fullTime?.home ?? match.score?.halfTime?.home ?? 0;
  const awayScore =
    match.score?.fullTime?.away ?? match.score?.halfTime?.away ?? 0;
  const homeName = match.homeTeam?.name ?? 'PSG';
  const awayName = match.awayTeam?.name ?? 'Adversaire';

  const liveMatch: LiveMatchData = {
    status: 'live',
    minute: isPaused ? 45 : Math.min(elapsed, 120),
    period: isPaused ? 'HT' : 'LIVE',
    competition: match.competition?.name ?? 'Match',
    stadium: match.venue ?? 'Stade',
    referee: 'N/A',
    kickoff,
    home: {
      name: homeName,
      score: homeScore,
      shots: 0,
      shotsOnTarget: 0,
      possession: 0,
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
      possession: 0,
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
    lineups: { home: [], away: [] },
    nextMatch: {
      opponent: awayName,
      date: kickoff,
      competition: match.competition?.name ?? 'Match',
      venue: match.venue ?? 'Stade',
    },
  };

  apiCache.timestamp = Date.now();
  apiCache.data = liveMatch;
  return liveMatch;
};

export async function readLiveMatch(): Promise<LiveMatchData | null> {
  const apiLive = await fetchLiveMatchFromApi();
  if (apiLive) return apiLive;
  const limitedLive = await fetchLiveMatchFromFootballData();
  if (limitedLive) return limitedLive;
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
