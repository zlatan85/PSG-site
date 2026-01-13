'use client';

import { FormEvent, useState } from 'react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function FanWallForm() {
  const [handle, setHandle] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch('/api/fan-wall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, message }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      setHandle('');
      setMessage('');
      setStatus('sent');
    } catch (error) {
      console.error('Failed to submit fan wall post:', error);
      setStatus('error');
    }
  };

  return (
    <form onSubmit={onSubmit} className="mb-6 rounded-xl bg-white/5 p-4 border border-white/10">
      <div>
        <input
          type="text"
          name="handle"
          placeholder="@handle (optionnel)"
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
          className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
        />
      </div>
      <textarea
        name="message"
        placeholder="Ton message pour la fan zone..."
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        className="mt-3 w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 min-h-[90px]"
        required
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors disabled:opacity-60"
          type="submit"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? 'Envoi...' : 'Envoyer'}
        </button>
        {status === 'sent' && (
          <p className="text-xs text-green-200">Merci ! Ton message attend la moderation.</p>
        )}
        {status === 'error' && (
          <p className="text-xs text-red-200">Oups, impossible d'envoyer pour le moment.</p>
        )}
        {status === 'idle' && (
          <p className="text-xs text-gray-400">
            Ton message sera publie apres moderation.
          </p>
        )}
      </div>
    </form>
  );
}
