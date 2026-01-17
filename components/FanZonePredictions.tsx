'use client';

import { useEffect, useState } from 'react';

interface PredictionEntry {
  id: number;
  name: string;
  handle: string;
  homeScore: number;
  awayScore: number;
  approved: boolean;
  createdAt: string;
}

export default function FanZonePredictions() {
  const [predictions, setPredictions] = useState<PredictionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const loadPredictions = async () => {
    try {
      const response = await fetch('/api/fan-zone/predictions');
      const data = await response.json();
      setPredictions(Array.isArray(data) ? data : []);
    } catch (loadError) {
      console.error('Failed to load predictions:', loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPredictions();
  }, []);

  const submitPrediction = async () => {
    setStatus('sending');
    try {
      const response = await fetch('/api/fan-zone/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          handle,
          homeScore: Number(homeScore),
          awayScore: Number(awayScore),
        }),
      });
      if (!response.ok) {
        throw new Error('Request failed');
      }
      setName('');
      setHandle('');
      setHomeScore('');
      setAwayScore('');
      setStatus('sent');
      await loadPredictions();
    } catch (submitError) {
      console.error('Failed to submit prediction:', submitError);
      setStatus('error');
    }
  };

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-white">Pronostic score exact</h3>
        <p className="text-sm text-gray-400">Ton score pour le match du jour.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          placeholder="Ton pseudo"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
        />
        <input
          type="text"
          placeholder="@handle (optionnel)"
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
          className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
        />
        <input
          type="number"
          min="0"
          placeholder="Score PSG"
          value={homeScore}
          onChange={(event) => setHomeScore(event.target.value)}
          className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
        />
        <input
          type="number"
          min="0"
          placeholder="Score adverse"
          value={awayScore}
          onChange={(event) => setAwayScore(event.target.value)}
          className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
        />
      </div>
      <button
        type="button"
        onClick={submitPrediction}
        disabled={status === 'sending' || !name}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors disabled:opacity-60"
      >
        {status === 'sending' ? 'Envoi...' : 'Envoyer mon prono'}
      </button>
      {status === 'sent' && (
        <p className="text-xs text-green-200">Merci ! Ton prono est en attente de moderation.</p>
      )}
      {status === 'error' && (
        <p className="text-xs text-red-200">Oups, impossible d'envoyer pour le moment.</p>
      )}

      <div className="pt-2 border-t border-white/10">
        <div className="flex items-center justify-between text-sm text-gray-300 mb-3">
          <span>Pronostics valides</span>
          {loading && <span>Chargement...</span>}
        </div>
        <div className="space-y-2">
          {predictions.map((item) => (
            <div key={item.id} className="rounded-lg bg-white/5 px-4 py-2 text-sm text-gray-300 flex justify-between">
              <span className="text-white font-semibold">
                {item.name} <span className="text-gray-400">{item.handle}</span>
              </span>
              <span className="text-white font-semibold">{item.homeScore} - {item.awayScore}</span>
            </div>
          ))}
          {!loading && predictions.length === 0 && (
            <p className="text-sm text-gray-400">Aucun prono publie pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  );
}
