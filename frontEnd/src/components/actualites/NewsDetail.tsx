'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useNewsItem } from '@/lib/queries/useNews';

interface Props {
  id: string;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function NewsDetail({ id }: Props) {
  const { data: news, isLoading } = useNewsItem(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05091a] flex items-center justify-center text-slate-500">
        Chargement...
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-[#05091a] flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Article introuvable.</p>
        <Link href="/actualites" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
          ← Retour aux actualités
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#05091a] min-h-screen">
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-blue-900/20 to-[#05091a] overflow-hidden">
        {news.imageUrl && (
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05091a] via-[#05091a]/30 to-transparent" />
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/actualites"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Retour aux actualités
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-xs bg-blue-700/80 text-white rounded capitalize">
            {news.category}
          </span>
          <span className="text-slate-500 text-sm">{formatDate(news.publishedAt)}</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-white mb-10 leading-tight">
          {news.title}
        </h1>

        <div
          className="prose prose-invert prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />
      </div>
    </div>
  );
}