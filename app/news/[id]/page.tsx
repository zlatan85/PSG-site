'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ReactNode, useEffect, useMemo, useState } from 'react';
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
            className="w-full rounded-2xl object-cover shadow-lg"
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
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
            <div className="glass rounded-2xl overflow-hidden">
              <img
                src={article.image || '/api/placeholder/1200/700'}
                alt={article.title}
                className="w-full h-72 object-cover sm:h-96"
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
