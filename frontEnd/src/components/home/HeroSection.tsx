'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useProfile } from '@/lib/queries/useProfile';

const ParticleField = dynamic(
  () =>
    import('@/components/three/ParticleField').then((m) => m.ParticleField),
  { ssr: false }
);

export function HeroSection() {
  const { data: profile } = useProfile();

  const name = profile
    ? `${profile.firstName} ${profile.lastName}`
    : '';

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#05091a]">
      <div className="absolute inset-0 pointer-events-none">
        <ParticleField />
      </div>

      <div className="relative z-10 text-center px-4 w-full max-w-6xl mx-auto">
        {name && (
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight"
          >
            {name}
          </motion.h1>
        )}

        {profile?.desiredPosition && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-2xl md:text-3xl text-blue-400 font-mono mb-4"
          >
            {profile.desiredPosition}
          </motion.p>
        )}

        {profile?.tagline && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto"
          >
            {profile.tagline}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/projets"
            className="px-8 py-3 bg-blue-700 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
          >
            Voir mes projets
          </Link>
          {profile?.email && (
            <a
              href={`mailto:${profile.email}`}
              className="px-8 py-3 border border-blue-700/50 hover:border-blue-700 text-slate-300 hover:text-white font-semibold rounded-lg transition-colors"
            >
              Me contacter
            </a>
          )}
        </motion.div>
      </div>

      <motion.div
        animate={{ opacity: [1, 0.3, 1], y: [0, 6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-600"
      >
        <ChevronDown size={32} />
      </motion.div>
    </section>
  );
}