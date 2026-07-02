'use client';

import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { NewsCard } from './NewsCard';
import { useNews } from '@/lib/queries/useNews';

export function NewsList() {
  const { data: newsList, isLoading } = useNews();

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
        Chargement...
      </div>
    );
  }

  if (!newsList?.length) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
        Aucune actualité pour le moment.
      </div>
    );
  }

  const sorted = [...newsList].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <section className="py-24 bg-[#05091a]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((news, i) => (
            <AnimatedSection key={news.id} delay={i * 0.05}>
              <NewsCard news={news} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}