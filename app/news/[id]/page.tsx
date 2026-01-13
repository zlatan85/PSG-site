import Link from 'next/link';
import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { FadeIn } from '../../../components/MotionWrapper';
import { readNews } from '../../../lib/news-store';

export const dynamic = 'force-dynamic';

interface NewsPageProps {
  params: { id: string };
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
      <p key={`p-${blocks.length}`} className="text-gray-200">
        {renderInline(trimmed)}
      </p>
    );
  });

  flushList();
  return blocks;
};

export default async function NewsDetailPage({ params }: NewsPageProps) {
  const news = await readNews();
  const article = news.find((item) => String(item.id) === params.id);

  if (!article) {
    notFound();
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
                <div className="space-y-4 leading-relaxed">
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
