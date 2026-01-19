'use client';

import { useEffect, useState } from 'react';
import FanWallForm from './FanWallForm';

interface UserInfo {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
}

type AuthMode = 'login' | 'register';

export default function FanWallComposer() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [resendCooldown, setResendCooldown] = useState(0);

  const loadMe = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        setUser(null);
        return;
      }
      const data = await response.json();
      setUser(data.user ?? null);
    } catch (loadError) {
      console.error('Failed to load session:', loadError);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  const handleAuth = async () => {
    setError('');
    setMessage('');
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login' ? { email, password } : { name, email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = response.status === 403 ? 'Email non verifie.' : 'Impossible de se connecter.';
        setError(errorText);
        return;
      }

      const data = await response.json();
      if (mode === 'register') {
        setMessage('Compte cree. Un code de verification a ete envoye.');
      }
      await loadMe();
      setPassword('');
    } catch (authError) {
      console.error('Auth error:', authError);
      setError('Impossible de se connecter.');
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
      await loadMe();
    } catch (verifyError) {
      console.error('Verify error:', verifyError);
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
    } catch (resendError) {
      console.error('Resend error:', resendError);
      setResendStatus('error');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  if (loading) {
    return (
      <div className="mb-6 rounded-xl bg-white/5 p-4 border border-white/10 text-sm text-gray-400">
        Chargement de la connexion...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mb-6 rounded-xl bg-white/5 p-4 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Connecte-toi pour participer</h3>
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-sm text-red-200 hover:text-red-100"
          >
            {mode === 'login' ? 'Creer un compte' : 'J\'ai deja un compte'}
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {mode === 'register' && (
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
        {error && <p className="text-xs text-red-200">{error}</p>}
        {message && <p className="text-xs text-green-200">{message}</p>}
        <button
          type="button"
          onClick={handleAuth}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
        >
          {mode === 'login' ? 'Se connecter' : 'Creer le compte'}
        </button>
      </div>
    );
  }

  if (!user.emailVerified) {
    return (
      <div className="mb-6 rounded-xl bg-white/5 p-4 border border-white/10 space-y-3">
        <div>
          <p className="text-sm text-gray-300">Verification email requise</p>
          <p className="text-white font-semibold">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Code de verification"
            value={verifyInput}
            onChange={(event) => setVerifyInput(event.target.value)}
            className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
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
        {resendStatus === 'error' && (
          <p className="text-xs text-red-200">Impossible d&apos;envoyer le code.</p>
        )}
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between rounded-xl bg-white/5 p-4 border border-white/10">
        <div>
          <p className="text-sm text-gray-300">Connecte en tant que</p>
          <p className="text-white font-semibold">{user.name}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
        >
          Se deconnecter
        </button>
      </div>
      <FanWallForm />
    </div>
  );
}
