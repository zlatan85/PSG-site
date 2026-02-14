'use client';

import { useEffect, useMemo, useState } from 'react';
import FanWallComposer from './FanWallComposer';

type LiveComment = {
  id: number;
  name: string;
  handle?: string;
  message: string;
  time?: string;
};

type LiveCommentsProps = {
  initialComments: LiveComment[];
};

export default function LiveComments({ initialComments }: LiveCommentsProps) {
  const [comments, setComments] = useState<LiveComment[]>(initialComments);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const loadComments = async () => {
    setStatus('loading');
    try {
      const response = await fetch('/api/fan-wall', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Request failed');
      }
      const data = (await response.json()) as LiveComment[];
      setComments(Array.isArray(data) ? data.slice(0, 12) : []);
      setStatus('idle');
    } catch (error) {
      console.error('Failed to refresh live comments:', error);
      setStatus('error');
    }
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      loadComments();
    }, 10_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const sortedComments = useMemo(
    () => [...comments].sort((a, b) => b.id - a.id),
    [comments]
  );

  return (
    <div className="glass rounded-2xl p-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h3 className="text-2xl font-semibold text-white">Commentaires en direct</h3>
        <button
          type="button"
          onClick={loadComments}
          className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
        >
          Actualiser
        </button>
      </div>

      <FanWallComposer />

      {status === 'error' && (
        <p className="mb-4 text-sm text-red-200">Impossible d&apos;actualiser le chat pour le moment.</p>
      )}

      {sortedComments.length === 0 ? (
        <p className="text-gray-300">Aucun commentaire valide pour le moment.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sortedComments.map((post) => (
            <div key={post.id} className="rounded-xl bg-white/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-white font-semibold">
                  {post.name} {post.handle ? <span className="text-gray-300">{post.handle}</span> : null}
                </p>
                <span className="text-xs text-gray-300">{post.time || 'Live'}</span>
              </div>
              <p className="mt-2 text-sm text-gray-200">{post.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
