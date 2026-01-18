'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface UserInfo {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
}

interface CommentEntry {
  id: number;
  articleId: number;
  name: string;
  handle: string;
  message: string;
  approved: boolean;
  createdAt: string;
}

interface ArticleCommentsProps {
  articleId: number | null;
}

export default function ArticleComments({ articleId }: ArticleCommentsProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [comments, setComments] = useState<CommentEntry[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [handle, setHandle] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  const loadMe = async () => {
    try {
      setLoadingUser(true);
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        setUser(null);
        return;
      }
      const data = await response.json();
      setUser(data.user ?? null);
    } catch (error) {
      console.error('Failed to load session:', error);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  const loadComments = async () => {
    if (!articleId) return;
    try {
      setLoadingComments(true);
      const response = await fetch(`/api/news-comments?articleId=${articleId}`);
      const data = await response.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  useEffect(() => {
    loadComments();
  }, [articleId]);

  const handleAuth = async () => {
    setAuthError('');
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
      setPassword('');
      await loadMe();
    } catch (error) {
      console.error('Auth error:', error);
      setAuthError('Impossible de se connecter.');
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
    } catch (error) {
      console.error('Verify error:', error);
      setVerifyStatus('error');
    }
  };

  const handleResend = async () => {
    if (!user) return;
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
    } catch (error) {
      console.error('Resend error:', error);
      setResendStatus('error');
    }
  };

  const submitComment = async () => {
    if (!articleId || !message.trim()) return;
    setStatus('sending');
    try {
      const response = await fetch('/api/news-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          message,
          handle,
        }),
      });
      if (!response.ok) {
        setStatus('error');
        return;
      }
      setMessage('');
      setHandle('');
      setStatus('sent');
      await loadComments();
    } catch (error) {
      console.error('Failed to submit comment:', error);
      setStatus('error');
    }
  };

  if (!articleId) {
    return null;
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-white">Commentaires</h3>
        <Link href="/fan-zone" className="text-sm text-red-200 hover:text-red-100">
          Fan Zone
        </Link>
      </div>

      {loadingUser && <p className="text-sm text-gray-400">Chargement du compte...</p>}

      {!loadingUser && !user && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-300">Connecte-toi pour commenter.</p>
            <button
              type="button"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="text-sm text-red-200 hover:text-red-100"
            >
              {authMode === 'login' ? 'Creer un compte' : "J'ai deja un compte"}
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
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
          {authError && <p className="text-xs text-red-200">{authError}</p>}
          <button
            type="button"
            onClick={handleAuth}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
          >
            {authMode === 'login' ? 'Se connecter' : 'Creer le compte'}
          </button>
        </div>
      )}

      {!loadingUser && user && !user.emailVerified && (
        <div className="space-y-3">
          <p className="text-sm text-gray-300">Verification email requise.</p>
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
              className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors"
            >
              Renvoyer le code
            </button>
          </div>
          {verifyStatus === 'error' && <p className="text-xs text-red-200">Code invalide ou expire.</p>}
          {resendStatus === 'ok' && <p className="text-xs text-green-200">Email renvoye.</p>}
          {resendStatus === 'error' && (
            <p className="text-xs text-red-200">Impossible d&apos;envoyer le code.</p>
          )}
        </div>
      )}

      {!loadingUser && user && user.emailVerified && (
        <div className="space-y-3">
          <textarea
            placeholder="Votre commentaire"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="min-h-[120px] w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <input
            type="text"
            placeholder="@handle (optionnel)"
            value={handle}
            onChange={(event) => setHandle(event.target.value)}
            className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <button
            type="button"
            onClick={submitComment}
            disabled={status === 'sending' || !message.trim()}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors disabled:opacity-60"
          >
            {status === 'sending' ? 'Envoi...' : 'Publier le commentaire'}
          </button>
          {status === 'sent' && (
            <p className="text-xs text-green-200">Merci ! Ton commentaire est en attente de moderation.</p>
          )}
          {status === 'error' && (
            <p className="text-xs text-red-200">Impossible d&apos;envoyer pour le moment.</p>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div className="text-sm text-gray-300">Commentaires publies</div>
        {loadingComments && <p className="text-sm text-gray-400">Chargement...</p>}
        {!loadingComments && comments.length === 0 && (
          <p className="text-sm text-gray-400">Aucun commentaire pour le moment.</p>
        )}
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-xl bg-white/5 p-4 border border-white/10">
              <div className="flex items-center justify-between text-sm text-gray-300">
                <span className="text-white font-semibold">
                  {comment.name} <span className="text-gray-400">{comment.handle}</span>
                </span>
                <span>{new Date(comment.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <p className="mt-2 text-gray-200">{comment.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
