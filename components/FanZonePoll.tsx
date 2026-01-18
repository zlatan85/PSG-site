'use client';

import { useEffect, useMemo, useState } from 'react';

interface PollOption {
  label: string;
  votes: number;
}

interface PollData {
  question: string;
  options: PollOption[];
}

export default function FanZonePoll() {
  const [poll, setPoll] = useState<PollData | null>(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPoll = async () => {
      try {
        const response = await fetch('/api/fan-zone/poll');
        const data = await response.json();
        setPoll(data);
      } catch (loadError) {
        console.error('Failed to load poll:', loadError);
        setError('Impossible de charger le sondage.');
      } finally {
        setLoading(false);
      }
    };

    loadPoll();
  }, []);

  const totalVotes = useMemo(() => {
    if (!poll) return 0;
    return poll.options.reduce((sum, option) => sum + option.votes, 0);
  }, [poll]);

  const handleVote = async (index: number) => {
    if (voted) return;
    setError('');
    try {
      const response = await fetch('/api/fan-zone/poll/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index }),
      });
      if (!response.ok) {
        throw new Error('Request failed');
      }
      const data = await response.json();
      setPoll(data);
      setVoted(true);
    } catch (voteError) {
      console.error('Failed to vote:', voteError);
      setError('Impossible de voter pour le moment.');
    }
  };

  if (loading) {
    return <div className="text-gray-300">Chargement du sondage...</div>;
  }

  if (!poll) {
    return <div className="text-gray-300">Aucun sondage disponible.</div>;
  }

  return (
    <div className="glass matchday-glow matchday-sweep rounded-2xl p-6">
      <h3 className="text-xl font-semibold text-white mb-2">Sondage supporters</h3>
      <p className="text-gray-300 mb-6">{poll.question}</p>
      <div className="space-y-4">
        {poll.options.map((option, index) => {
          const percent = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          return (
            <button
              key={`${option.label}-${index}`}
              type="button"
              onClick={() => handleVote(index)}
              className="w-full text-left rounded-lg bg-white/5 px-4 py-3 border border-white/10 hover:border-white/30 transition-colors"
            >
              <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                <span className="text-white font-semibold">{option.label}</span>
                <span>{percent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-red-500" style={{ width: `${percent}%` }} />
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-4 text-xs text-gray-400">
        {totalVotes} vote{totalVotes > 1 ? 's' : ''} au total.
      </div>
      {voted && <p className="mt-2 text-xs text-green-200">Merci pour ton vote !</p>}
      {error && <p className="mt-2 text-xs text-red-200">{error}</p>}
    </div>
  );
}
