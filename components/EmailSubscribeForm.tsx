'use client';

import { useState } from 'react';

interface EmailSubscribeFormProps {
  ctaLabel: string;
}

export default function EmailSubscribeForm({ ctaLabel }: EmailSubscribeFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  const handleSubmit = async () => {
    if (!email) return;
    setStatus('sending');
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        setStatus('error');
        return;
      }
      setStatus('ok');
      setEmail('');
    } catch (error) {
      console.error('Failed to subscribe:', error);
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        type="email"
        placeholder="Ton email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={status === 'sending' || !email}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors disabled:opacity-60"
      >
        {status === 'sending' ? 'Envoi...' : ctaLabel}
      </button>
      {status === 'ok' && <p className="text-xs text-green-200">Inscription confirmee.</p>}
      {status === 'error' && (
        <p className="text-xs text-red-200">Impossible de valider pour le moment.</p>
      )}
    </div>
  );
}
