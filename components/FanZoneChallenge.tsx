'use client';

import { useEffect, useState } from 'react';

interface ChallengeEntry {
  id: number;
  name: string;
  handle: string;
  caption: string;
  mediaUrl: string;
  mediaType: string;
  approved: boolean;
  createdAt: string;
}

export default function FanZoneChallenge() {
  const [items, setItems] = useState<ChallengeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('photo');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const loadItems = async () => {
    try {
      const response = await fetch('/api/fan-zone/challenges');
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (loadError) {
      console.error('Failed to load challenges:', loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const submitChallenge = async () => {
    setStatus('sending');
    try {
      const response = await fetch('/api/fan-zone/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          handle,
          caption,
          mediaUrl,
          mediaType,
        }),
      });
      if (!response.ok) {
        throw new Error('Request failed');
      }
      setName('');
      setHandle('');
      setCaption('');
      setMediaUrl('');
      setMediaType('photo');
      setStatus('sent');
      await loadItems();
    } catch (submitError) {
      console.error('Failed to submit challenge:', submitError);
      setStatus('error');
    }
  };

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-white">Matchday Challenge</h3>
        <p className="text-sm text-gray-400">Partage ta photo ou video en rouge et bleu.</p>
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
          type="url"
          placeholder="Lien image ou video"
          value={mediaUrl}
          onChange={(event) => setMediaUrl(event.target.value)}
          className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
        />
        <select
          value={mediaType}
          onChange={(event) => setMediaType(event.target.value)}
          className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <option value="photo" className="bg-blue-900">Photo</option>
          <option value="video" className="bg-blue-900">Video</option>
        </select>
      </div>
      <textarea
        placeholder="Legende (optionnelle)"
        value={caption}
        onChange={(event) => setCaption(event.target.value)}
        className="min-h-[100px] w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
      />
      <button
        type="button"
        onClick={submitChallenge}
        disabled={status === 'sending' || !name || !mediaUrl}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors disabled:opacity-60"
      >
        {status === 'sending' ? 'Envoi...' : 'Envoyer au challenge'}
      </button>
      {status === 'sent' && (
        <p className="text-xs text-green-200">Merci ! Ton contenu est en attente de moderation.</p>
      )}
      {status === 'error' && (
        <p className="text-xs text-red-200">Oups, impossible d'envoyer pour le moment.</p>
      )}

      <div className="pt-2 border-t border-white/10">
        <div className="flex items-center justify-between text-sm text-gray-300 mb-3">
          <span>Galerie fans</span>
          {loading && <span>Chargement...</span>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
              {item.mediaType === 'photo' ? (
                <img
                  src={item.mediaUrl}
                  alt={item.caption || item.name}
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="h-40 w-full flex items-center justify-center bg-black/50 text-gray-200 text-sm">
                  <a href={item.mediaUrl} className="underline" target="_blank" rel="noreferrer">
                    Voir la video
                  </a>
                </div>
              )}
              <div className="p-3">
                <p className="text-sm text-white font-semibold">{item.name}</p>
                <p className="text-xs text-gray-400">{item.handle}</p>
                {item.caption && <p className="text-sm text-gray-300 mt-2">{item.caption}</p>}
              </div>
            </div>
          ))}
          {!loading && items.length === 0 && (
            <p className="text-sm text-gray-400">Aucun contenu publie pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  );
}
