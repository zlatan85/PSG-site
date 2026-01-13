'use client';

import { useState } from 'react';
import { FadeIn, ScaleIn } from '../../components/MotionWrapper';

const transfers = [
  {
    id: 1,
    type: 'incoming',
    player: 'Vitinha',
    from: 'Roma',
    to: 'PSG',
    fee: '41.5M €',
    date: '2025-01-15',
    position: 'Midfielder',
    nationality: 'Portugal'
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
    nationality: 'Spain'
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
    nationality: 'France'
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
    nationality: 'Portugal'
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
    nationality: 'France'
  }
];

const upcomingTransfers = [
  {
    player: 'João Cancelo',
    position: 'Defender',
    currentClub: 'Barcelona',
    interest: 'High',
    status: 'Negotiations'
  },
  {
    player: 'Enzo Fernandez',
    position: 'Midfielder',
    currentClub: 'Chelsea',
    interest: 'Medium',
    status: 'Monitoring'
  },
  {
    player: 'Raphinha',
    position: 'Forward',
    currentClub: 'Barcelona',
    interest: 'High',
    status: 'Advanced Talks'
  }
];

export default function TransfersPage() {
  const [filter, setFilter] = useState('all');

  const filteredTransfers = transfers.filter(transfer => {
    if (filter === 'all') return true;
    return transfer.type === filter;
  });

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <FadeIn delay={0.2}>
          <div className="matchday-hero rounded-3xl p-8 sm:p-10 lg:p-12 mb-12">
            <div className="matchday-tape">Mercato</div>
            <div className="matchday-orb left matchday-float" />
            <div className="matchday-orb right matchday-float" />
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="space-y-4">
                <h1 className="font-display text-5xl uppercase text-white sm:text-6xl">
                  Mercato PSG
                </h1>
                <p className="text-gray-300 max-w-xl">
                  Arrivees, departs, rumeurs et negocations: suivez le mercato en temps reel.
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-200">
                  {['Live updates', 'Rumeurs fiables', 'Deals officiels'].map((item) => (
                    <span key={item} className="rounded-full bg-white/10 px-4 py-1">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 p-6 text-sm text-gray-200">
                <p className="text-white font-semibold mb-3">Indice mercato</p>
                <p className="text-gray-300">
                  Fenetre active: concentration sur les postes offensifs et la profondeur de banc.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Transfer Summary */}
        <FadeIn delay={0.4}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass rounded-2xl p-6 text-center border border-white/10">
              <div className="text-3xl font-bold text-green-400 mb-2">2</div>
              <div className="text-gray-300">Arrivées</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center border border-white/10">
              <div className="text-3xl font-bold text-red-400 mb-2">2</div>
              <div className="text-gray-300">Départs</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center border border-white/10">
              <div className="text-3xl font-bold text-blue-400 mb-2">€104.5M</div>
              <div className="text-gray-300">Dépenses nettes</div>
            </div>
          </div>
        </FadeIn>

        {/* Filters */}
        <FadeIn delay={0.5}>
          <div className="glass rounded-2xl p-6 mb-8">
            <div className="flex flex-wrap gap-4 justify-center">
              {['all', 'incoming', 'outgoing'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    filter === filterOption
                      ? 'bg-red-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {filterOption === 'all' ? 'Tous' : filterOption === 'incoming' ? 'Arrivées' : 'Départs'}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Transfer List */}
        <div className="space-y-4 mb-12">
          {filteredTransfers.map((transfer, index) => (
            <ScaleIn key={transfer.id} delay={0.6 + index * 0.1}>
              <div className="glass rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${transfer.type === 'incoming' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{transfer.player}</h3>
                      <p className="text-gray-400">{transfer.position} • {transfer.nationality}</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">
                      {transfer.type === 'incoming' ? 'De' : 'Vers'}
                    </div>
                    <div className="text-white font-medium">
                      {transfer.type === 'incoming' ? transfer.from : transfer.to}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Montant</div>
                    <div className="text-white font-semibold">{transfer.fee}</div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Date</div>
                    <div className="text-white">{new Date(transfer.date).toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>
              </div>
            </ScaleIn>
          ))}
        </div>

        {/* Upcoming Transfers */}
        <FadeIn delay={0.8}>
          <div className="glass rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Transferts a venir</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTransfers.map((transfer, index) => (
                <ScaleIn key={index} delay={1.0 + index * 0.1}>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-2">{transfer.player}</h3>
                    <p className="text-gray-400 text-sm mb-2">{transfer.position}</p>
                    <p className="text-gray-300 text-sm mb-3">{transfer.currentClub}</p>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs px-2 py-1 rounded ${
                        transfer.interest === 'High' ? 'bg-green-500/20 text-green-400' :
                        transfer.interest === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {transfer.interest}
                      </span>
                      <span className="text-xs text-gray-400">{transfer.status}</span>
                    </div>
                  </div>
                </ScaleIn>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
