'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { FadeIn, ScaleIn } from '../../components/MotionWrapper';

type AuthMode = 'login' | 'register';

type UserInfo = {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
};

type ProfileInfo = {
  handle: string;
  bio: string;
  favoritePlayer: string;
  location: string;
  avatarUrl: string;
  bannerUrl: string;
};

const emptyProfile: ProfileInfo = {
  handle: '',
  bio: '',
  favoritePlayer: '',
  location: '',
  avatarUrl: '',
  bannerUrl: '',
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [profile, setProfile] = useState<ProfileInfo>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle');

  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [resendCooldown, setResendCooldown] = useState(0);

  const avatarLabel = useMemo(() => {
    const source = user?.name || user?.email || 'PSG';
    return source
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return '';
    try {
      return new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    } catch {
      return '';
    }
  }, [user?.createdAt]);

  const profileCompletion = useMemo(() => {
    const fields = [
      profile.handle,
      profile.bio,
      profile.favoritePlayer,
      profile.location,
      profile.avatarUrl,
      profile.bannerUrl,
    ];
    const filled = fields.filter((value) => value && value.trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) {
          setUser(null);
          return;
        }
        const data = await response.json();
        setUser(data.user ?? null);
        setProfile({ ...emptyProfile, ...(data.profile ?? {}) });
        setName(data.user?.name ?? '');
        setEmail(data.user?.email ?? '');
      } catch (error) {
        console.error('Failed to load profile:', error);
        setLoadError('Impossible de charger le profil.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  const handleAuth = async () => {
    setAuthError('');
    setAuthMessage('');
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = authMode === 'login' ? { email, password } : { name, email, password };
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        setAuthError(response.status === 403 ? 'Email non verifie.' : 'Impossible de se connecter.');
        return;
      }
      if (authMode === 'register') {
        setAuthMessage('Compte cree. Un code de verification a ete envoye.');
      }
      setPassword('');
      setLoading(true);
      const refreshed = await fetch('/api/profile');
      const data = await refreshed.json();
      setUser(data.user ?? null);
      setProfile({ ...emptyProfile, ...(data.profile ?? {}) });
    } catch (error) {
      console.error('Auth error:', error);
      setAuthError('Impossible de se connecter.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!user) return;
    setVerifyStatus('sending');
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, code: verifyInput }),
      });
      if (!response.ok) {
        setVerifyStatus('error');
        return;
      }
      setVerifyStatus('ok');
      setVerifyInput('');
      const refreshed = await fetch('/api/profile');
      const data = await refreshed.json();
      setUser(data.user ?? null);
      setProfile({ ...emptyProfile, ...(data.profile ?? {}) });
    } catch (error) {
      console.error('Verify error:', error);
      setVerifyStatus('error');
    }
  };

  const handleResend = async () => {
    if (!user) return;
    if (resendCooldown > 0) return;
    setResendStatus('sending');
    try {
      const response = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      if (!response.ok) {
        setResendStatus('error');
        return;
      }
      setResendStatus('ok');
      setResendCooldown(30);
    } catch (error) {
      console.error('Resend error:', error);
      setResendStatus('error');
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaveStatus('saving');
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          ...profile,
        }),
      });
      if (!response.ok) {
        throw new Error('Request failed');
      }
      const data = await response.json();
      setUser(data.user ?? user);
      setProfile({ ...emptyProfile, ...(data.profile ?? {}) });
      setSaveStatus('ok');
    } catch (error) {
      console.error('Failed to save profile:', error);
      setSaveStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center text-gray-300">Chargement du profil...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center text-gray-300">{loadError}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <FadeIn delay={0.1}>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f1a2b] via-[#162445] to-[#2a1b33] p-8 sm:p-10">
            <div className="absolute inset-0 opacity-60">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: profile.bannerUrl
                    ? `url(${profile.bannerUrl})`
                    : 'linear-gradient(120deg, rgba(59,130,246,0.25), rgba(239,68,68,0.2))',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0b1020] via-[#0b1020]/70 to-transparent" />
            </div>
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.2em] text-gray-200">
                  Profil supporter
                </div>
                <h1 className="font-display text-4xl uppercase text-white sm:text-5xl">
                  Mon espace ULTEAM PSG-X
                </h1>
                <p className="max-w-xl text-gray-300">
                  Personnalise ton profil, affiche ton club de coeur et suis tes interactions dans la fan zone.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/fan-zone"
                    className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
                  >
                    Retour fan zone
                  </Link>
                  <Link
                    href="/news"
                    className="rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                  >
                    Voir les actus
                  </Link>
                </div>
              </div>

              <div className="glass rounded-2xl border border-white/10 p-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt="Avatar"
                        className="h-20 w-20 rounded-full border border-white/20 object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl font-semibold text-white">
                        {avatarLabel}
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 rounded-full border border-[#0b1020] bg-emerald-400 px-2 py-0.5 text-[10px] font-semibold text-black">
                      {user?.emailVerified ? 'Verifie' : 'A verifier'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Pseudo</p>
                    <p className="text-xl font-semibold text-white">{user?.name || 'Supporter'}</p>
                    <p className="text-xs text-gray-400">{profile.handle ? `@${profile.handle}` : user?.email}</p>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <span>Profil complete</span>
                    <span>{profileCompletion}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-red-500" style={{ width: `${profileCompletion}%` }} />
                  </div>
                </div>
                <div className="mt-6 grid gap-3 text-sm text-gray-300 sm:grid-cols-3">
                  <div className="rounded-xl bg-white/5 p-3">
                    <div className="text-xs text-gray-400">Statut</div>
                    <div className="text-white font-semibold">Supporter</div>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <div className="text-xs text-gray-400">Membre depuis</div>
                    <div className="text-white font-semibold">{memberSince || '2026'}</div>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <div className="text-xs text-gray-400">Equipe</div>
                    <div className="text-white font-semibold">PSG</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {!user && (
          <ScaleIn delay={0.2}>
            <div className="glass rounded-2xl border border-white/10 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Connecte-toi</h2>
                  <p className="text-sm text-gray-400">Accede a ton profil pour personnaliser ton experience.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-sm text-red-200 hover:text-red-100"
                >
                  {authMode === 'login' ? 'Creer un compte' : "J'ai deja un compte"}
                </button>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {authMode === 'register' && (
                  <input
                    type="text"
                    placeholder="Prenom"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                )}
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              {authError && <p className="mt-2 text-xs text-red-200">{authError}</p>}
              {authMessage && <p className="mt-2 text-xs text-green-200">{authMessage}</p>}
              <button
                type="button"
                onClick={handleAuth}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
              >
                {authMode === 'login' ? 'Se connecter' : 'Creer le compte'}
              </button>
            </div>
          </ScaleIn>
        )}

        {user && !user.emailVerified && (
          <ScaleIn delay={0.2}>
            <div className="glass rounded-2xl border border-white/10 p-6 space-y-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Verification email requise</h2>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
              <input
                type="text"
                placeholder="Code de verification"
                value={verifyInput}
                onChange={(event) => setVerifyInput(event.target.value)}
                className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleVerify}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
                >
                  {verifyStatus === 'sending' ? 'Verification...' : 'Verifier'}
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors disabled:opacity-60"
                  disabled={resendStatus === 'sending' || resendCooldown > 0}
                >
                  {resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : 'Renvoyer le code'}
                </button>
              </div>
              {verifyStatus === 'error' && <p className="text-xs text-red-200">Code invalide ou expire.</p>}
              {verifyStatus === 'ok' && <p className="text-xs text-green-200">Email verifie. Merci !</p>}
              {resendStatus === 'ok' && <p className="text-xs text-green-200">Email renvoye.</p>}
              {resendStatus === 'error' && <p className="text-xs text-red-200">Impossible d&apos;envoyer le code.</p>}
            </div>
          </ScaleIn>
        )}

        {user && user.emailVerified && (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <ScaleIn delay={0.25}>
              <div className="glass rounded-2xl border border-white/10 p-6 space-y-5">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Infos du profil</h2>
                  <p className="text-sm text-gray-400">Personnalise ton identite supporter.</p>
                </div>
                <div className="grid gap-4">
                  <input
                    type="text"
                    placeholder="Pseudo affiche"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <input
                    type="text"
                    placeholder="Handle (ex: ultras-75)"
                    value={profile.handle}
                    onChange={(event) => setProfile((current) => ({ ...current, handle: event.target.value }))}
                    className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <textarea
                    placeholder="Bio supporter"
                    value={profile.bio}
                    onChange={(event) => setProfile((current) => ({ ...current, bio: event.target.value }))}
                    className="min-h-[120px] w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Joueur prefere"
                      value={profile.favoritePlayer}
                      onChange={(event) => setProfile((current) => ({ ...current, favoritePlayer: event.target.value }))}
                      className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    <input
                      type="text"
                      placeholder="Ville / Pays"
                      value={profile.location}
                      onChange={(event) => setProfile((current) => ({ ...current, location: event.target.value }))}
                      className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="URL avatar (ex: /uploads/mon-avatar.jpg)"
                    value={profile.avatarUrl}
                    onChange={(event) => setProfile((current) => ({ ...current, avatarUrl: event.target.value }))}
                    className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <input
                    type="text"
                    placeholder="URL bannere (ex: /uploads/ma-banniere.jpg)"
                    value={profile.bannerUrl}
                    onChange={(event) => setProfile((current) => ({ ...current, bannerUrl: event.target.value }))}
                      className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors disabled:opacity-60"
                    disabled={saveStatus === 'saving'}
                  >
                    {saveStatus === 'saving' ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                  {saveStatus === 'ok' && <span className="text-xs text-green-200">Profil mis a jour.</span>}
                  {saveStatus === 'error' && <span className="text-xs text-red-200">Sauvegarde impossible.</span>}
                </div>
              </div>
            </ScaleIn>

            <ScaleIn delay={0.3}>
              <div className="glass rounded-2xl border border-white/10 p-6 space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Experience supporter</h2>
                  <p className="text-sm text-gray-400">Des bonus pour animer ta saison.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3 text-sm">
                  {[
                    { label: 'Commentaires', value: '—' },
                    { label: 'Likes recus', value: '—' },
                    { label: 'Pronostics', value: '—' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-white/5 p-3 text-gray-300">
                      <div className="text-xs text-gray-400">{item.label}</div>
                      <div className="text-white font-semibold">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {[
                    {
                      title: 'Badge Ultra',
                      detail: 'Publie 3 reactions dans la fan zone pour debloquer ton badge.',
                    },
                    {
                      title: 'Score parfait',
                      detail: 'Tente un pronostic exact pour gagner un highlight sur la home.',
                    },
                    {
                      title: 'Photo du match',
                      detail: 'Partage un contenu dans le defi jour de match.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="rounded-xl bg-white/5 p-4">
                      <div className="text-white font-semibold">{item.title}</div>
                      <div className="text-sm text-gray-400">{item.detail}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
                  Ton profil est visible seulement pour toi pour le moment. Bientot: stats et badges publics.
                </div>
              </div>
            </ScaleIn>
          </div>
        )}
      </div>
    </div>
  );
}
