'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

type Draft = {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  status: string;
};

const withToken = (href: string, token: string) => (token ? `${href}?token=${encodeURIComponent(token)}` : href);

export default function AgentDraftPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const draftId = Number(params?.id);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const loadDraft = async () => {
    if (!token) {
      setError('ADMIN_TOKEN manquant dans l\'URL.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`/api/agent/drafts/${draftId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Request failed');
      const data = await response.json();
      setDraft(data?.draft ?? null);
    } catch (err) {
      console.error('Failed to load draft', err);
      setError('Impossible de charger le draft.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Number.isFinite(draftId)) {
      loadDraft();
    }
  }, [draftId]);

  const saveDraft = async () => {
    if (!draft) return;
    setStatus('Sauvegarde...');
    try {
      const response = await fetch(`/api/agent/drafts/${draftId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: draft.title,
          excerpt: draft.excerpt,
          content: draft.content,
          imageUrl: draft.imageUrl,
        }),
      });
      if (!response.ok) throw new Error('Save failed');
      const data = await response.json();
      setDraft(data?.draft ?? draft);
      setStatus('Sauvegarde OK');
    } catch (err) {
      console.error('Failed to save draft', err);
      setStatus('Erreur sauvegarde');
    }
  };

  const publishDraft = async () => {
    if (!draft) return;
    setStatus('Publication...');
    try {
      const response = await fetch(`/api/agent/drafts/${draftId}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Publish failed');
      setStatus('Publie');
      await loadDraft();
    } catch (err) {
      console.error('Failed to publish draft', err);
      setStatus('Erreur publication');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen px-6 py-12 text-white">
        <div className="glass rounded-2xl p-6 text-blue-100">Chargement...</div>
      </div>
    );
  }

  if (error || !draft) {
    return (
      <div className="min-h-screen px-6 py-12 text-white">
        <div className="glass rounded-2xl p-6 text-red-200">{error || 'Draft introuvable.'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div>
          <Link href={withToken('/admin/agent/clusters', token)} className="text-xs text-blue-200">
            ← Retour aux clusters
          </Link>
          <h1 className="mt-3 text-3xl font-semibold">Edition draft</h1>
          <p className="text-sm text-blue-100/70">Statut: {draft.status}</p>
        </div>

        <div className="glass rounded-2xl p-5 flex flex-col gap-4">
          <label className="text-xs uppercase tracking-[0.2em] text-blue-200">Titre</label>
          <input
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white"
          />

          <label className="text-xs uppercase tracking-[0.2em] text-blue-200">Extrait</label>
          <textarea
            value={draft.excerpt}
            onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })}
            className="min-h-[120px] rounded-lg bg-white/10 px-4 py-2 text-sm text-white"
          />

          <label className="text-xs uppercase tracking-[0.2em] text-blue-200">Contenu</label>
          <textarea
            value={draft.content}
            onChange={(event) => setDraft({ ...draft, content: event.target.value })}
            className="min-h-[240px] rounded-lg bg-white/10 px-4 py-2 text-sm text-white"
          />

          <label className="text-xs uppercase tracking-[0.2em] text-blue-200">Image (URL)</label>
          <input
            value={draft.imageUrl ?? ''}
            onChange={(event) => setDraft({ ...draft, imageUrl: event.target.value })}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white"
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={saveDraft}
              className="rounded-lg bg-white/10 px-4 py-2 text-xs uppercase tracking-wide text-white hover:bg-white/20"
            >
              Sauvegarder
            </button>
            <button
              type="button"
              onClick={publishDraft}
              className="rounded-lg bg-red-500/80 px-4 py-2 text-xs uppercase tracking-wide text-white hover:bg-red-500"
            >
              Publier
            </button>
            {status && <span className="text-xs text-blue-100/70">{status}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
