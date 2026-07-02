'use client';

import Link from 'next/link';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { useSkills } from '@/lib/queries/useSkills';

export function SkillsPreview() {
  const { data: skills } = useSkills();
  const preview = skills?.slice(0, 8) ?? [];

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {preview.map((skill, i) => (
            <AnimatedSection key={skill.id} delay={i * 0.05}>
              <div className="bg-[#0a1128] border border-white/5 rounded-xl p-4 hover:border-blue-700/30 transition-colors h-full">
                {skill.icon && (
                  <span className="text-2xl mb-2 block">{skill.icon}</span>
                )}
                <p className="text-white font-medium text-sm mb-3">
                  {skill.title}
                </p>
                <div className="w-full bg-[#05091a] rounded-full h-1.5">
                  <div
                    className="bg-blue-700 h-1.5 rounded-full transition-all"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}