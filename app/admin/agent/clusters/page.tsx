'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type ClusterSummary = {
  id: number;
  topicTitle: string;
  status: string;
  category: string | null;
  confidence: number;
  updatedAt: string;
  _count: { items: number; contents: number; drafts: number };
};

const withToken = (href: string, token: string) => (token ? `${href}?token=${encodeURIComponent(token)}` : href);

export default function AgentClustersPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState('pending');
  const [clusters, setClusters] = useState<ClusterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jobStatus, setJobStatus] = useState('');
  const [manualUrls, setManualUrls] = useState('');

  const loadClusters = async () => {
    if (!token) {
      setError('ADMIN_TOKEN manquant dans l\'URL.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/agent/clusters?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Request failed');
      const data = await response.json();
      setClusters(Array.isArray(data?.clusters) ? data.clusters : []);
    } catch (err) {
      console.error('Failed to load clusters', err);
      setError('Impossible de charger les clusters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClusters();
  }, [status]);

  const runJob = async (endpoint: 'ingest' | 'cluster' | 'reset') => {
    if (!token) return;
    setJobStatus('Execution en cours...');
    try {
      const response = await fetch(`/api/agent/jobs/${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Job failed');
      setJobStatus(`Job ${endpoint} termine.`);
      await loadClusters();
    } catch (err) {
      console.error('Job failed', err);
      setJobStatus(`Job ${endpoint} en echec.`);
    }
  };

  const ingestManual = async () => {
    if (!token) return;
    const urls = manualUrls
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (urls.length === 0) {
      setJobStatus('Ajoute au moins une URL.');
      return;
    }
    setJobStatus('Ingestion manuelle en cours...');
    try {
      const response = await fetch('/api/agent/jobs/ingest-urls', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls }),
      });
      if (!response.ok) throw new Error('Manual ingest failed');
      setJobStatus('Ingestion manuelle terminee.');
      setManualUrls('');
      await loadClusters();
    } catch (err) {
      console.error('Manual ingest failed', err);
      setJobStatus('Echec ingestion manuelle.');
    }
  };

  const statusOptions = useMemo(() => ['pending', 'draft', 'published'], []);

  return (
    <div className="min-h-screen px-6 py-12 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-200">PSG News Agent</p>
          <h1 className="text-3xl font-semibold">Clusters editorial</h1>
          <p className="text-sm text-blue-100/70">
            Pipeline MVP: ingestion → clustering → brief → draft → publication.
          </p>
        </div>

        <div className="glass rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-blue-100">Filtre statut</label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option} className="text-slate-900">
                  {option}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => runJob('ingest')}
              className="rounded-lg bg-white/10 px-3 py-2 text-xs uppercase tracking-wide text-white hover:bg-white/20"
            >
              Lancer ingest
            </button>
            <button
              type="button"
              onClick={() => runJob('cluster')}
              className="rounded-lg bg-white/10 px-3 py-2 text-xs uppercase tracking-wide text-white hover:bg-white/20"
            >
              Lancer cluster
            </button>
            <button
              type="button"
              onClick={() => runJob('reset')}
              className="rounded-lg bg-red-500/80 px-3 py-2 text-xs uppercase tracking-wide text-white hover:bg-red-500"
            >
              Purger agent
            </button>
          </div>
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-blue-200">
                Ingestion manuelle (1 URL par ligne)
              </label>
              <textarea
                value={manualUrls}
                onChange={(event) => setManualUrls(event.target.value)}
                className="mt-2 min-h-[120px] w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white"
                placeholder="https://www.psg.fr/...\nhttps://www.lequipe.fr/...\n"
              />
            </div>
            <button
              type="button"
              onClick={ingestManual}
              className="h-11 rounded-lg bg-white/10 px-4 text-xs uppercase tracking-wide text-white hover:bg-white/20"
            >
              Ingest URLs
            </button>
          </div>
          {jobStatus && <p className="text-xs text-blue-100/70">{jobStatus}</p>}
        </div>

        {loading && <div className="glass rounded-2xl p-6 text-blue-100">Chargement...</div>}
        {error && <div className="glass rounded-2xl p-6 text-red-200">{error}</div>}

        {!loading && !error && (
          <div className="grid gap-4">
            {clusters.length === 0 && (
              <div className="glass rounded-2xl p-6 text-blue-100/80">Aucun cluster pour ce statut.</div>
            )}
            {clusters.map((cluster) => (
              <Link
                key={cluster.id}
                href={withToken(`/admin/agent/clusters/${cluster.id}`, token)}
                className="glass rounded-2xl p-5 transition hover:border-white/40"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{cluster.topicTitle}</h2>
                    <p className="text-xs text-blue-100/70">
                      {cluster.category ?? 'Categorie libre'} · confiance {Math.round(cluster.confidence * 100)}%
                    </p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide">
                    {cluster.status}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-blue-100/70">
                  <span>Sources: {cluster._count.items}</span>
                  <span>Briefs: {cluster._count.contents}</span>
                  <span>Drafts: {cluster._count.drafts}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
