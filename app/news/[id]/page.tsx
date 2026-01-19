'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import ArticleComments from '../../../components/ArticleComments';
import { FadeIn } from '../../../components/MotionWrapper';

export const dynamic = 'force-dynamic';

interface NewsPageProps {
  params?: { id?: string };
}

interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  content?: string;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderInline = (value: string) => {
  const escaped = escapeHtml(value);
  const withBold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const withItalic = withBold.replace(/\*(.+?)\*/g, '<em>$1</em>');
  const withCode = withItalic.replace(/`(.+?)`/g, '<code>$1</code>');
  return <span dangerouslySetInnerHTML={{ __html: withCode }} />;
};

const renderMarkdownBlocks = (content: string): ReactNode[] => {
  const lines = content.split('\n');
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (listType && listItems.length > 0) {
      const items = listItems.map((item, index) => (
        <li key={`${listType}-${index}`}>{renderInline(item)}</li>
      ));
      blocks.push(
        listType === 'ul' ? (
          <ul key={`list-${blocks.length}`} className="list-disc pl-6 space-y-2">
            {items}
          </ul>
        ) : (
          <ol key={`list-${blocks.length}`} className="list-decimal pl-6 space-y-2">
            {items}
          </ol>
        )
      );
    }
    listItems = [];
    listType = null;
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    const imageMatch = trimmed.match(/^!\[(.*?)]\((\S+?)(?:\s+"(.*?)")?\)$/);
    if (imageMatch) {
      const [, alt, src, caption] = imageMatch;
      flushList();
      blocks.push(
        <figure key={`img-${blocks.length}`} className="space-y-2">
          <img
            src={src}
            alt={alt || 'Illustration'}
            loading="lazy"
            decoding="async"
            className="w-full max-h-[520px] rounded-2xl object-contain bg-black/40 shadow-lg"
          />
          {caption ? <figcaption className="text-xs text-gray-400">{caption}</figcaption> : null}
        </figure>
      );
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      blocks.push(
        <h3 key={`h3-${blocks.length}`} className="text-xl font-semibold text-white">
          {renderInline(trimmed.replace(/^###\s+/, ''))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      blocks.push(
        <h2 key={`h2-${blocks.length}`} className="text-2xl font-semibold text-white">
          {renderInline(trimmed.replace(/^##\s+/, ''))}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith('> ')) {
      flushList();
      blocks.push(
        <blockquote
          key={`quote-${blocks.length}`}
          className="border-l-2 border-red-400/60 pl-4 text-gray-300 italic"
        >
          {renderInline(trimmed.replace(/^>\s+/, ''))}
        </blockquote>
      );
      return;
    }

    const unordered = trimmed.match(/^- (.+)/);
    if (unordered) {
      if (!listType) listType = 'ul';
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(unordered[1]);
      return;
    }

    const ordered = trimmed.match(/^\d+\.\s+(.+)/);
    if (ordered) {
      if (!listType) listType = 'ol';
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(ordered[1]);
      return;
    }

    flushList();
    blocks.push(
      <p key={`p-${blocks.length}`} className="text-gray-200 text-base leading-relaxed">
        {renderInline(trimmed)}
      </p>
    );
  });

  flushList();
  return blocks;
};

export default function NewsDetailPage({ params: pageParams }: NewsPageProps) {
  const routeParams = useParams<{ id?: string }>();
  const rawId = routeParams?.id ?? pageParams?.id ?? '';
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [likes, setLikes] = useState(0);
  const [likeStatus, setLikeStatus] = useState<'idle' | 'loading' | 'liked' | 'error'>('idle');
  const [shareUrl, setShareUrl] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/news');
        if (!response.ok) {
          throw new Error('Request failed');
        }
        const data = await response.json();
        setNews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load news:', error);
        setLoadError("Impossible de charger l'article.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const decodedId = useMemo(() => {
    if (!rawId) return '';
    try {
      return decodeURIComponent(rawId).trim();
    } catch (error) {
      console.warn('Failed to decode article id:', error);
      return rawId.trim();
    }
  }, [rawId]);
  const idMatch = decodedId.match(/\d+/);
  const numericId = idMatch ? Number(idMatch[0]) : Number(decodedId);
  const slugify = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const normalizedId = decodedId.toLowerCase();
  const article = useMemo(() => {
    if (!news.length) return null;
    const numericArticle = Number.isFinite(numericId)
      ? news.find((item) => Number(item.id) === numericId)
      : undefined;
    return (
      news.find((item) => String(item.id) === decodedId) ??
      numericArticle ??
      news.find((item) => slugify(item.title) === normalizedId) ??
      null
    );
  }, [decodedId, news, normalizedId, numericId]);

  const commentArticleId = Number.isFinite(numericId)
    ? numericId
    : article?.id ?? null;

  useEffect(() => {
    if (!commentArticleId) return;
    const loadLikes = async () => {
      try {
        const response = await fetch(`/api/news-likes/${commentArticleId}`);
        if (!response.ok) {
          throw new Error('Request failed');
        }
        const data = await response.json();
        setLikes(Number(data?.count) || 0);
      } catch (error) {
        console.error('Failed to load likes:', error);
      }
    };
    loadLikes();
  }, [commentArticleId]);

  useEffect(() => {
    if (!commentArticleId) return;
    try {
      const stored = window.localStorage.getItem(`article-liked:${commentArticleId}`);
      if (stored === '1') {
        setLikeStatus('liked');
      }
    } catch (error) {
      console.warn('Failed to read like state:', error);
    }
  }, [commentArticleId]);

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const handleLike = async () => {
    if (!commentArticleId || likeStatus === 'liked' || likeStatus === 'loading') return;
    setLikeStatus('loading');
    try {
      const response = await fetch(`/api/news-likes/${commentArticleId}`, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Request failed');
      }
      const data = await response.json();
      setLikes(Number(data?.count) || likes + 1);
      setLikeStatus('liked');
      window.localStorage.setItem(`article-liked:${commentArticleId}`, '1');
    } catch (error) {
      console.error('Failed to like article:', error);
      setLikeStatus('error');
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus('ok');
    } catch (error) {
      console.error('Failed to copy link:', error);
      setCopyStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8 flex items-center justify-center">
        <p className="text-gray-300">Chargement de l&apos;article...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8 flex items-center justify-center">
        <p className="text-gray-300">{loadError}</p>
      </div>
    );
  }

  if (!article) {
    const fallback = news.slice(0, 3);
    return (
      <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6 text-center">
          <h1 className="text-3xl font-bold text-white">Article introuvable</h1>
          <p className="text-gray-300">On n&apos;a pas trouve cette actu. Voici les plus recentes.</p>
          <div className="grid gap-4 sm:grid-cols-3 text-left">
            {fallback.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.id}`}
                className="glass rounded-lg p-4 hover:bg-white/10 transition-colors"
              >
                <div className="text-sm text-gray-400">{item.date}</div>
                <div className="text-white font-semibold line-clamp-2">{item.title}</div>
              </Link>
            ))}
          </div>
          <Link
            href="/news"
            className="inline-flex items-center rounded-lg bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
          >
            Retour aux actualites
          </Link>
        </div>
      </div>
    );
  }

  const content = article.content || article.excerpt;
  const blocks = renderMarkdownBlocks(content);

  return (
    <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <FadeIn delay={0.2}>
          <div className="space-y-4 text-center">
            <p className="text-sm text-red-300">{article.date}</p>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">{article.title}</h1>
            <p className="text-gray-300">{article.excerpt}</p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleLike}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors disabled:opacity-60"
                disabled={likeStatus === 'loading' || likeStatus === 'liked'}
              >
                <span>{likeStatus === 'liked' ? 'Merci !' : "J'aime"}</span>
                <span className="text-xs text-gray-300">({likes})</span>
              </button>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white/10 px-3 py-2 text-gray-200 hover:text-white hover:bg-white/20 transition-colors"
                >
                  Partager sur X
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white/10 px-3 py-2 text-gray-200 hover:text-white hover:bg-white/20 transition-colors"
                >
                  Facebook
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${article.title} ${shareUrl}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white/10 px-3 py-2 text-gray-200 hover:text-white hover:bg-white/20 transition-colors"
                >
                  WhatsApp
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="rounded-full bg-white/10 px-3 py-2 text-gray-200 hover:text-white hover:bg-white/20 transition-colors"
                >
                  Copier le lien
                </button>
              </div>
              {copyStatus === 'ok' && (
                <span className="text-xs text-green-200">Lien copie.</span>
              )}
              {copyStatus === 'error' && (
                <span className="text-xs text-red-200">Copie impossible.</span>
              )}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
            <div className="glass rounded-2xl overflow-hidden">
              <img
                src={article.image || '/api/placeholder/1200/700'}
                alt={article.title}
                loading="lazy"
                decoding="async"
                className="w-full max-h-[520px] object-contain bg-black/40"
              />
              <div className="p-8 text-gray-200">
                <div className="space-y-6">
                  {blocks.map((block, index) => (
                    <div key={`${article.id}-block-${index}`}>{block}</div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

        <FadeIn delay={0.35}>
          <ArticleComments articleId={commentArticleId} />
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="text-center">
            <Link
              href="/news"
              className="inline-flex items-center rounded-lg bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Retour aux actualites
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
