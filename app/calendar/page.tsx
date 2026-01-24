'use client';

import { useEffect, useState } from 'react';
import { FadeIn, ScaleIn } from '../../components/MotionWrapper';

interface MatchEntry {
  id: number;
  date: string;
  time: string;
  home: string;
  away: string;
  competition: string;
  stadium: string;
  status: 'upcoming' | 'played';
  score?: string;
  result?: 'W' | 'D' | 'L';
}

interface StandingRow {
  pos: number;
  club: string;
  pts: number;
  j: number;
  g: number;
  n: number;
  p: number;
  diff: string;
}

interface TopScorerRow {
  pos: number;
  player: string;
  club: string;
  goals: number;
}

interface TopAssistRow {
  pos: number;
  player: string;
  club: string;
  assists: number;
}

const defaultStandings = {
  ligue1: [
    { pos: 1, club: 'PSG', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
    { pos: 2, club: 'Monaco', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
    { pos: 3, club: 'Lille', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
    { pos: 4, club: 'Marseille', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
    { pos: 5, club: 'Rennes', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
    { pos: 6, club: 'Lyon', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
  ],
  championsLeague: [
    { pos: 1, club: 'PSG', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
    { pos: 2, club: 'Dortmund', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
    { pos: 3, club: 'Milan', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
    { pos: 4, club: 'Newcastle', pts: 0, j: 0, g: 0, n: 0, p: 0, diff: '+0' },
  ],
};

const defaultTopStats = {
  scorers: [
    { pos: 1, player: 'K. Mbappe', club: 'PSG', goals: 0 },
    { pos: 2, player: 'O. Dembele', club: 'PSG', goals: 0 },
    { pos: 3, player: 'R. Kolo Muani', club: 'PSG', goals: 0 },
  ],
  assists: [
    { pos: 1, player: 'A. Hakimi', club: 'PSG', assists: 0 },
    { pos: 2, player: 'Vitinha', club: 'PSG', assists: 0 },
    { pos: 3, player: 'K. Mbappe', club: 'PSG', assists: 0 },
  ],
  clScorers: [
    { pos: 1, player: 'K. Mbappe', club: 'PSG', goals: 0 },
    { pos: 2, player: 'O. Dembele', club: 'PSG', goals: 0 },
    { pos: 3, player: 'R. Kolo Muani', club: 'PSG', goals: 0 },
  ],
  clAssists: [
    { pos: 1, player: 'A. Hakimi', club: 'PSG', assists: 0 },
    { pos: 2, player: 'Vitinha', club: 'PSG', assists: 0 },
    { pos: 3, player: 'K. Mbappe', club: 'PSG', assists: 0 },
  ],
};

export default function CalendarPage() {
  const [filter, setFilter] = useState('all');
  const [showAllMatches, setShowAllMatches] = useState(false);
  const [topStatsLeague, setTopStatsLeague] = useState<'ligue1' | 'cl'>('ligue1');
  const [showAllLigue1, setShowAllLigue1] = useState(false);
  const [showAllChampionsLeague, setShowAllChampionsLeague] = useState(false);
  const [matches, setMatches] = useState<MatchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [standings, setStandings] = useState(defaultStandings);
  const [standingsLoading, setStandingsLoading] = useState(true);
  const [topStats, setTopStats] = useState(defaultTopStats);
  const [topStatsLoading, setTopStatsLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const response = await fetch('/api/matches');
        const data = await response.json();
        setMatches(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load matches:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  useEffect(() => {
    setShowAllMatches(false);
  }, [filter]);

  useEffect(() => {
    setShowAllMatches(false);
  }, [filter]);

  useEffect(() => {
    const loadStandings = async () => {
      try {
        const response = await fetch('/api/standings');
        const data = await response.json();
        if (data?.ligue1 && data?.championsLeague) {
          setStandings(data);
        }
      } catch (error) {
        console.error('Failed to load standings:', error);
      } finally {
        setStandingsLoading(false);
      }
    };

    loadStandings();
  }, []);

  useEffect(() => {
    const loadTopStats = async () => {
      try {
        const response = await fetch('/api/top-stats');
        const data = await response.json();
        if (data?.scorers && data?.assists) {
          setTopStats({
            ...defaultTopStats,
            ...data,
            scorers: Array.isArray(data.scorers) ? data.scorers : defaultTopStats.scorers,
            assists: Array.isArray(data.assists) ? data.assists : defaultTopStats.assists,
            clScorers: Array.isArray(data.clScorers) ? data.clScorers : defaultTopStats.clScorers,
            clAssists: Array.isArray(data.clAssists) ? data.clAssists : defaultTopStats.clAssists,
          });
        }
      } catch (error) {
        console.error('Failed to load top stats:', error);
      } finally {
        setTopStatsLoading(false);
      }
    };

    loadTopStats();
  }, []);

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return match.status === 'upcoming';
    if (filter === 'played') return match.status === 'played';
    return match.competition.toLowerCase().includes(filter.toLowerCase());
  });

  const sortedMatches = [...filteredMatches].sort((a, b) => {
    const aTime = new Date(`${a.date}T${a.time}`).getTime();
    const bTime = new Date(`${b.date}T${b.time}`).getTime();

    if (filter === 'played') {
      return bTime - aTime;
    }

    if (filter === 'all') {
      if (a.status !== b.status) {
        return a.status === 'upcoming' ? -1 : 1;
      }
      return a.status === 'upcoming' ? aTime - bTime : bTime - aTime;
    }

    return aTime - bTime;
  });

  const primaryMatches = sortedMatches.slice(0, 4);
  const extraMatches = sortedMatches.slice(4);
  const ligue1Rows = showAllLigue1 ? standings.ligue1 : standings.ligue1.slice(0, 6);
  const championsLeagueRows = showAllChampionsLeague
    ? standings.championsLeague
    : standings.championsLeague.slice(0, 6);
  const topScorers = topStatsLeague === 'ligue1' ? topStats.scorers : topStats.clScorers;
  const topAssists = topStatsLeague === 'ligue1' ? topStats.assists : topStats.clAssists;

  const getResultColor = (result?: string) => {
    switch (result) {
      case 'W': return 'text-green-400';
      case 'D': return 'text-yellow-400';
      case 'L': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {loading && (
          <div className="text-center text-gray-300 mb-8">Chargement du calendrier...</div>
        )}
        <FadeIn delay={0.2}>
          <div className="matchday-hero rounded-3xl p-8 sm:p-10 lg:p-12 mb-12">
            <div className="matchday-tape">Calendrier</div>
            <div className="matchday-orb left matchday-float" />
            <div className="matchday-orb right matchday-float" />
            <div className="space-y-4">
              <h1 className="font-display text-5xl uppercase text-white sm:text-6xl">
                Calendrier PSG
              </h1>
              <p className="text-gray-300 max-w-2xl">
                Tous les matchs, toutes les competitions. Ajoute les rendez-vous a ton agenda.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Filters */}
        <FadeIn delay={0.4}>
          <div className="glass rounded-lg p-6 mb-8">
            <div className="flex flex-wrap gap-4 justify-center">
              {['all', 'upcoming', 'played', 'ligue 1', 'champions league'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    filter === filterOption
                      ? 'bg-red-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Matches List */}
        <div className="space-y-4">
          {primaryMatches.map((match, index) => (
            <ScaleIn key={match.id} delay={0.6 + index * 0.1}>
              <div className="glass rounded-lg p-6 border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-400">{new Date(match.date).toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                      <div className="text-lg font-bold text-white">{new Date(match.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</div>
                      <div className="text-sm text-gray-400">{match.time}</div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4">
                        <div className="text-right flex-1">
                          <div className={`font-semibold ${match.home === 'PSG' ? 'text-red-400' : 'text-white'}`}>
                            {match.home}
                          </div>
                        </div>
                        <div className="text-center px-4">
                          {match.status === 'played' ? (
                            <div className={`text-xl font-bold ${getResultColor(match.result)}`}>
                              {match.score}
                            </div>
                          ) : (
                            <div className="text-gray-400">VS</div>
                          )}
                        </div>
                        <div className="text-left flex-1">
                          <div className={`font-semibold ${match.away === 'PSG' ? 'text-red-400' : 'text-white'}`}>
                            {match.away}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-400">{match.competition}</div>
                    <div className="text-sm text-gray-400">{match.stadium}</div>
                    {match.status === 'played' && match.result && (
                      <div className={`text-sm font-medium ${getResultColor(match.result)}`}>
                        {match.result === 'W' ? 'Victoire' : match.result === 'D' ? 'Nul' : 'Défaite'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScaleIn>
          ))}
        </div>

        {extraMatches.length > 0 && (
          <FadeIn delay={0.75}>
            <div className="mt-4 glass rounded-lg border border-white/10 p-4">
              <button
                type="button"
                onClick={() => setShowAllMatches((current) => !current)}
                className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
              >
                {showAllMatches
                  ? 'Masquer les autres matchs'
                  : `Voir ${extraMatches.length} matchs supplémentaires`}
              </button>
              <div
                className={`overflow-hidden transition-all duration-500 ${
                  showAllMatches ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="mt-4 space-y-4">
                  {extraMatches.map((match, index) => (
                    <ScaleIn key={match.id} delay={0.8 + index * 0.05}>
                      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="text-sm text-gray-300">
                            <span className="text-white font-semibold">{match.home}</span> vs{' '}
                            <span className="text-white font-semibold">{match.away}</span>
                            <div className="text-xs text-gray-400 mt-1">
                              {match.date} · {match.time} · {match.competition}
                            </div>
                          </div>
                          {match.status === 'played' && (
                            <div className={`text-sm font-semibold ${getResultColor(match.result)}`}>
                              {match.score}
                            </div>
                          )}
                        </div>
                      </div>
                    </ScaleIn>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {sortedMatches.length === 0 && (
          <FadeIn delay={0.8}>
            <div className="text-center py-12">
              <p className="text-gray-300 text-lg">Aucun match trouvé pour ce filtre.</p>
            </div>
          </FadeIn>
        )}

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <ScaleIn delay={0.2}>
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-white">Classement Ligue 1</h2>
                <span className="text-xs text-gray-400">
                  {standingsLoading ? 'Chargement...' : 'Mise a jour manuelle'}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-300">
                  <thead className="text-xs uppercase text-gray-400 border-b border-white/10">
                    <tr>
                      <th className="py-2 text-left">#</th>
                      <th className="py-2 text-left">Club</th>
                      <th className="py-2 text-right">Pts</th>
                      <th className="py-2 text-right">J</th>
                      <th className="py-2 text-right">G</th>
                      <th className="py-2 text-right">N</th>
                      <th className="py-2 text-right">P</th>
                      <th className="py-2 text-right">Diff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ligue1Rows.map((row) => (
                      <tr key={row.club} className="border-b border-white/5 last:border-0">
                        <td className="py-2">{row.pos}</td>
                        <td className={`py-2 ${row.club === 'PSG' ? 'text-red-300 font-semibold' : ''}`}>{row.club}</td>
                        <td className="py-2 text-right text-white font-semibold">{row.pts}</td>
                        <td className="py-2 text-right">{row.j}</td>
                        <td className="py-2 text-right">{row.g}</td>
                        <td className="py-2 text-right">{row.n}</td>
                        <td className="py-2 text-right">{row.p}</td>
                        <td className="py-2 text-right">{row.diff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {standings.ligue1.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllLigue1((current) => !current)}
                  className="mt-4 w-full rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
                >
                  {showAllLigue1 ? 'Masquer le classement complet' : `Voir ${standings.ligue1.length} clubs`}
                </button>
              )}
            </div>
          </ScaleIn>

          <ScaleIn delay={0.3}>
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-white">Classement Ligue des Champions</h2>
                <span className="text-xs text-gray-400">
                  {standingsLoading ? 'Chargement...' : 'Mise a jour manuelle'}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-300">
                  <thead className="text-xs uppercase text-gray-400 border-b border-white/10">
                    <tr>
                      <th className="py-2 text-left">#</th>
                      <th className="py-2 text-left">Club</th>
                      <th className="py-2 text-right">Pts</th>
                      <th className="py-2 text-right">J</th>
                      <th className="py-2 text-right">G</th>
                      <th className="py-2 text-right">N</th>
                      <th className="py-2 text-right">P</th>
                      <th className="py-2 text-right">Diff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {championsLeagueRows.map((row) => (
                      <tr key={row.club} className="border-b border-white/5 last:border-0">
                        <td className="py-2">{row.pos}</td>
                        <td className={`py-2 ${row.club === 'PSG' ? 'text-red-300 font-semibold' : ''}`}>{row.club}</td>
                        <td className="py-2 text-right text-white font-semibold">{row.pts}</td>
                        <td className="py-2 text-right">{row.j}</td>
                        <td className="py-2 text-right">{row.g}</td>
                        <td className="py-2 text-right">{row.n}</td>
                        <td className="py-2 text-right">{row.p}</td>
                        <td className="py-2 text-right">{row.diff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {standings.championsLeague.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllChampionsLeague((current) => !current)}
                  className="mt-4 w-full rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
                >
                  {showAllChampionsLeague
                    ? 'Masquer le classement complet'
                    : `Voir ${standings.championsLeague.length} clubs`}
                </button>
              )}
            </div>
          </ScaleIn>
        </div>

        <div className="mt-12">
          <FadeIn delay={0.34}>
            <div className="glass rounded-2xl p-6 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Buteurs & Passeurs</h2>
                  <p className="text-sm text-gray-400">Classements par competition.</p>
                </div>
                <div className="flex items-center gap-2">
                  {[
                    { key: 'ligue1' as const, label: 'Ligue 1' },
                    { key: 'cl' as const, label: 'Champions League' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTopStatsLeague(item.key)}
                      className={`rounded-full px-4 py-1 text-xs font-semibold transition-colors ${
                        topStatsLeague === item.key
                          ? 'bg-red-500/30 text-red-100'
                          : 'bg-white/10 text-gray-200 hover:bg-white/20'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          <div className="grid gap-8 lg:grid-cols-2">
            <ScaleIn delay={0.35}>
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-white">
                    {topStatsLeague === 'ligue1' ? 'Classement Buteurs' : 'Buteurs - Champions League'}
                  </h2>
                  <span className="text-xs text-gray-400">
                    {topStatsLoading ? 'Chargement...' : 'Mise a jour manuelle'}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-300">
                    <thead className="text-xs uppercase text-gray-400 border-b border-white/10">
                      <tr>
                        <th className="py-2 text-left">#</th>
                        <th className="py-2 text-left">Joueur</th>
                        <th className="py-2 text-left">Club</th>
                        <th className="py-2 text-right">Buts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topScorers.map((row) => (
                        <tr key={`${row.player}-${row.pos}`} className="border-b border-white/5 last:border-0">
                          <td className="py-2">{row.pos}</td>
                          <td className="py-2 text-white">{row.player}</td>
                          <td className="py-2">{row.club}</td>
                          <td className="py-2 text-right text-white font-semibold">{row.goals}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </ScaleIn>

            <ScaleIn delay={0.4}>
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-white">
                    {topStatsLeague === 'ligue1' ? 'Classement Passeurs' : 'Passeurs - Champions League'}
                  </h2>
                  <span className="text-xs text-gray-400">
                    {topStatsLoading ? 'Chargement...' : 'Mise a jour manuelle'}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-300">
                    <thead className="text-xs uppercase text-gray-400 border-b border-white/10">
                      <tr>
                        <th className="py-2 text-left">#</th>
                        <th className="py-2 text-left">Joueur</th>
                        <th className="py-2 text-left">Club</th>
                        <th className="py-2 text-right">Passes D</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topAssists.map((row) => (
                        <tr key={`${row.player}-${row.pos}`} className="border-b border-white/5 last:border-0">
                          <td className="py-2">{row.pos}</td>
                          <td className="py-2 text-white">{row.player}</td>
                          <td className="py-2">{row.club}</td>
                          <td className="py-2 text-right text-white font-semibold">{row.assists}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </ScaleIn>
          </div>
        </div>
      </div>
    </div>
  );
}
