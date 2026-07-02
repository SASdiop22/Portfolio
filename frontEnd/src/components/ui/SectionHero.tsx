'use client';

import dynamic from 'next/dynamic';

const MiniParticleField = dynamic(
  () =>
    import('@/components/three/MiniParticleField').then(
      (m) => m.MiniParticleField
    ),
  { ssr: false }
);

interface Props {
  title: string;
}

export function SectionHero({ title }: Props) {
  return (
    <section className="relative flex items-center justify-center h-52 overflow-hidden bg-[#05091a]">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <MiniParticleField />
      </div>
      <div className="relative z-10 text-center px-6">
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
          {title}
        </h1>
        <div className="mt-3 h-1 w-16 bg-blue-700 mx-auto rounded-full" />
      </div>
    </section>
  );
}