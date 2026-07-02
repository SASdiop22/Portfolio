'use client';

import { useProfile } from '@/lib/queries/useProfile';

export function CTASection() {
  const { data: profile } = useProfile();

  if (!profile) return null;

  return (
    <section className="py-24 bg-[#05091a] text-center">
      <div className="max-w-2xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-white mb-4">
          {profile.ctaTitle || 'Travaillons ensemble'}
        </h2>
        <p className="text-slate-400 mb-8">
          {profile.ctaText || 'Je suis disponible pour des opportunités freelance ou en CDI.'}
        </p>
        <a
          href={profile.email ? `mailto:${profile.email}` : '#'}
          className="inline-block px-10 py-4 bg-blue-700 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors text-lg"
        >
          Me contacter
        </a>
      </div>
    </section>
  );
}