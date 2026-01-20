'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FadeIn, ScaleIn } from '../../components/MotionWrapper';

interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  date: string;
}

export default function NewsPage() {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        const data = await response.json();
        setNewsArticles(data);
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Chargement des actus...</div>
      </div>
    );
  }

  const categories = ['Tous'];

  const filteredArticles = newsArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <FadeIn delay={0.2}>
          <div className="matchday-hero rounded-3xl p-8 sm:p-10 lg:p-12 mb-10">
            <div className="matchday-tape">Actualites</div>
            <div className="matchday-orb left matchday-float" />
            <div className="matchday-orb right matchday-float" />
            <div className="space-y-4">
              <h1 className="font-display text-5xl uppercase text-white sm:text-6xl">
                Redaction ULTEAM PSG-X
              </h1>
              <p className="text-gray-300 max-w-2xl text-base sm:text-lg">
                Actus, analyses, interviews et coulisses du club.
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-gray-200">
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">Breaking</span>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">Mercato</span>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">Inside PSG</span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Search and Filter */}
        <FadeIn delay={0.4}>
          <div className="glass rounded-2xl p-5 md:p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher une actu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div className="md:w-52">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  {categories.map(category => (
                    <option key={category} value={category} className="bg-blue-900">
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {sortedArticles.map((article, index) => (
            <ScaleIn key={article.id} delay={0.6 + index * 0.1}>
              <article className="glass rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-40px_rgba(59,130,246,0.8)] h-full flex flex-col">
                <div className="relative">
                  <img
                    src={article.image || '/api/placeholder/600/400'}
                    alt={article.title}
                    loading="lazy"
                    decoding="async"
                    className="h-48 w-full object-contain bg-black/40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020]/80 via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs text-gray-200">
                    {article.date}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">{article.title}</h3>
                  <p className="text-gray-300 mb-5 flex-1 line-clamp-3">{article.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Lecture 2 min</span>
                    <Link
                      href={`/news/${article.id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500/20 transition-colors"
                    >
                      Lire la suite
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            </ScaleIn>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <FadeIn delay={0.8}>
            <div className="text-center py-12">
              <p className="text-gray-300 text-lg">Aucun article ne correspond a vos criteres.</p>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
