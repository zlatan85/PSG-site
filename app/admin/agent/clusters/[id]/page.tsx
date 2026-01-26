'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

type ClusterDetail = {
  id: number;
  topicTitle: string;
  status: string;
  category: string | null;
  confidence: number;
  items: {
    id: number;
    similarity: number | null;
    item: {
      id: number;
      title: string;
      url: string;
      publishedAt: string | null;
      excerptShort: string | null;
      source: { name: string } | null;
    };
  }[];
  contents: { id: number; kind: string; content: string; createdAt: string }[];
  drafts: { id: number; title: string; status: string; createdAt: string }[];
};

const withToken = (href: string, token: string) => (token ? `${href}?token=${encodeURIComponent(token)}` : href);

export default function AgentClusterDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const rawId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const clusterId = rawId ? Number(rawId) : NaN;
  const [cluster, setCluster] = useState<ClusterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionStatus, setActionStatus] = useState('');

  const loadCluster = async () => {
    if (!token) {
      setError('ADMIN_TOKEN manquant dans l\'URL.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/agent/clusters/${clusterId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Request failed: ${response.status} ${detail}`);
      }
      const data = await response.json();
      setCluster(data?.cluster ?? null);
    } catch (err) {
      console.error('Failed to load cluster', err);
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(`Impossible de charger le cluster. ${message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(clusterId)) {
      setError('ID de cluster invalide dans l’URL.');
      setLoading(false);
      return;
    }
    loadCluster();
  }, [clusterId]);

  const runAction = async (endpoint: 'generate-brief' | 'generate-article') => {
    if (!token) return;
    setActionStatus('Traitement en cours...');
    try {
      const response = await fetch(`/api/agent/clusters/${clusterId}/${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Action failed');
      setActionStatus('Termine.');
      await loadCluster();
    } catch (err) {
      console.error('Action failed', err);
      setActionStatus('Echec de l\'action.');
    }
  };

  const latestBrief = useMemo(() => {
    if (!cluster?.contents) return null;
    return [...cluster.contents].reverse().find((item) => item.kind === 'brief') ?? null;
  }, [cluster]);

  if (loading) {
    return (
      <div className="min-h-screen px-6 py-12 text-white">
        <div className="glass rounded-2xl p-6 text-blue-100">Chargement...</div>
      </div>
    );
  }

  if (error || !cluster) {
    return (
      <div className="min-h-screen px-6 py-12 text-white">
        <div className="glass rounded-2xl p-6 text-red-200">{error || 'Cluster introuvable.'}</div>
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
          <h1 className="mt-3 text-3xl font-semibold">{cluster.topicTitle}</h1>
          <p className="text-sm text-blue-100/70">
            {cluster.category ?? 'Categorie libre'} · {cluster.status} · confiance {Math.round(cluster.confidence * 100)}%
          </p>
        </div>

        <div className="glass rounded-2xl p-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => runAction('generate-brief')}
            className="rounded-lg bg-white/10 px-3 py-2 text-xs uppercase tracking-wide text-white hover:bg-white/20"
          >
            Generer brief
          </button>
          <button
            type="button"
            onClick={() => runAction('generate-article')}
            className="rounded-lg bg-white/10 px-3 py-2 text-xs uppercase tracking-wide text-white hover:bg-white/20"
          >
            Generer draft
          </button>
          {actionStatus && <span className="text-xs text-blue-100/70">{actionStatus}</span>}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="glass rounded-2xl p-5">
            <h2 className="text-lg font-semibold">Sources detectees</h2>
            <ul className="mt-3 space-y-3 text-sm text-blue-100/80">
              {cluster.items.map((entry) => (
                <li key={entry.id} className="border-b border-white/10 pb-3 last:border-none">
                  <p className="font-medium text-white">{entry.item.title}</p>
                  <p className="text-xs text-blue-100/60">
                    {entry.item.source?.name ?? 'Source'} · {entry.item.publishedAt?.slice(0, 10) ?? 'Date inconnue'}
                  </p>
                  <a href={entry.item.url} className="text-xs text-blue-200" target="_blank" rel="noreferrer">
                    {entry.item.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <div className="glass rounded-2xl p-5">
              <h2 className="text-lg font-semibold">Dernier brief</h2>
              <pre className="mt-3 whitespace-pre-wrap text-xs text-blue-100/80">
                {latestBrief?.content || 'Aucun brief pour le moment.'}
              </pre>
            </div>
            <div className="glass rounded-2xl p-5">
              <h2 className="text-lg font-semibold">Drafts</h2>
              <div className="mt-3 space-y-2 text-sm">
                {cluster.drafts.length === 0 && <p className="text-blue-100/70">Aucun draft.</p>}
                {cluster.drafts.map((draft) => (
                  <Link
                    key={draft.id}
                    className="block rounded-lg border border-white/10 px-3 py-2 text-blue-100/90 hover:border-white/30"
                    href={withToken(`/admin/agent/drafts/${draft.id}`, token)}
                  >
                    <p className="font-medium text-white">{draft.title}</p>
                    <p className="text-xs text-blue-100/60">{draft.status}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
