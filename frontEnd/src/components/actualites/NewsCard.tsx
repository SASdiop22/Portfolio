import Link from 'next/link';
import type { News } from '@/lib/types';

interface Props {
  news: News;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function NewsCard({ news }: Props) {
  return (
    <Link href={`/actualites/${news.id}`} className="block group">
      <div className="bg-[#0a1128] border border-white/5 rounded-xl overflow-hidden hover:border-blue-700/30 transition-colors">
        <div className="relative h-48 bg-gradient-to-br from-blue-900/15 to-[#05091a] overflow-hidden">
          {news.imageUrl && (
            <img
              src={news.imageUrl}
              alt={news.title}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
          )}
          <span className="absolute top-3 left-3 px-2 py-0.5 text-xs bg-blue-700/80 text-white rounded capitalize">
            {news.category}
          </span>
        </div>
        <div className="p-5">
          <p className="text-slate-500 text-xs mb-2">{formatDate(news.publishedAt)}</p>
          <h3 className="text-white font-semibold mb-2 group-hover:text-blue-300 transition-colors leading-snug">
            {news.title}
          </h3>
          <p className="text-slate-400 text-sm line-clamp-3">
            {news.summary.length > 150
              ? `${news.summary.slice(0, 150)}...`
              : news.summary}
          </p>
        </div>
      </div>
    </Link>
  );
}