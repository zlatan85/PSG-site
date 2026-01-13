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

export default function CalendarPage() {
  const [filter, setFilter] = useState('all');
  const [matches, setMatches] = useState<MatchEntry[]>([]);
  const [loading, setLoading] = useState(true);

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

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return match.status === 'upcoming';
    if (filter === 'played') return match.status === 'played';
    return match.competition.toLowerCase().includes(filter.toLowerCase());
  });

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
          {filteredMatches.map((match, index) => (
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

        {filteredMatches.length === 0 && (
          <FadeIn delay={0.8}>
            <div className="text-center py-12">
              <p className="text-gray-300 text-lg">Aucun match trouvé pour ce filtre.</p>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
