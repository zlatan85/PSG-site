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
  const [selectedCategory, setSelectedCategory] = useState('All');

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
        <div className="text-white">Loading news...</div>
      </div>
    );
  }

  const categories = ["All"];

  const filteredArticles = newsArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <FadeIn delay={0.2}>
          <div className="matchday-hero rounded-3xl p-8 sm:p-10 lg:p-12 mb-12">
            <div className="matchday-tape">Actualites</div>
            <div className="matchday-orb left matchday-float" />
            <div className="matchday-orb right matchday-float" />
            <div className="space-y-4">
              <h1 className="font-display text-5xl uppercase text-white sm:text-6xl">
                ULTEAM PSG-X Newsroom
              </h1>
              <p className="text-gray-300 max-w-2xl">
                Actus, analyses, interviews et coulisses du club.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Search and Filter */}
        <FadeIn delay={0.4}>
          <div className="glass rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div className="md:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400"
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

        {/* News Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedArticles.map((article, index) => (
            <ScaleIn key={article.id} delay={0.6 + index * 0.1}>
              <div className="glass rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 h-full flex flex-col">
                <img
                  src={article.image || '/api/placeholder/600/400'}
                  alt={article.title}
                  loading="lazy"
                  decoding="async"
                  className="h-32 w-full object-contain bg-black/40"
                />
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">{article.date}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">{article.title}</h3>
                  <p className="text-gray-300 mb-4 flex-1 line-clamp-3">{article.excerpt}</p>
                  <div className="flex justify-end items-center">
                    <Link
                      href={`/news/${article.id}`}
                      className="text-red-400 hover:text-red-300 transition-colors font-medium"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              </div>
            </ScaleIn>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <FadeIn delay={0.8}>
            <div className="text-center py-12">
              <p className="text-gray-300 text-lg">No articles found matching your criteria.</p>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
