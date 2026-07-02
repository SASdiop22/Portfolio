'use client';

import Link from 'next/link';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { useSkills } from '@/lib/queries/useSkills';

export function SkillsPreview() {
  const { data: skills } = useSkills();
  const preview = skills?.slice(0, 12) ?? [];

  return (
    <section className="py-24 bg-[#05091a]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-white">Mes Compétences</h2>
          <Link
            href="/competences"
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            Voir tout →
          </Link>
        </div>

        <AnimatedSection delay={0.05}>
          <div className="flex flex-wrap gap-3">
            {preview.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0a1128] border border-white/5 rounded-full text-sm text-slate-300 font-medium hover:border-blue-700/40 hover:text-white transition-colors cursor-default"
              >
                {skill.icon && <span className="text-base leading-none">{skill.icon}</span>}
                {skill.title}
              </span>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}