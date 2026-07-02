'use client';

import { useSkills } from '@/lib/queries/useSkills';
import { useLanguages } from '@/lib/queries/useLanguages';
import { SkillCategory } from './SkillCategory';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export function CompetencesList() {
  const { data: skills, isLoading: skillsLoading } = useSkills();
  const { data: languages } = useLanguages();

  if (skillsLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
        Chargement...
      </div>
    );
  }

  if (!skills?.length) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
        Aucune compétence pour le moment.
      </div>
    );
  }

  const categories = Array.from(new Set(skills.map((s) => s.category)));

  return (
    <section className="py-24 bg-[#05091a]">
      <div className="max-w-6xl mx-auto px-6">
        {categories.map((cat) => (
          <SkillCategory
            key={cat}
            category={cat}
            skills={skills.filter((s) => s.category === cat)}
          />
        ))}

        {languages && languages.length > 0 && (
          <AnimatedSection delay={0.1}>
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-white mb-8 capitalize">Langues</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...languages].sort((a, b) => a.order - b.order).map((lang) => (
                  <div
                    key={lang.id}
                    className="bg-[#0a1128] border border-white/5 rounded-xl p-5 hover:border-blue-700/30 transition-colors"
                  >
                    <p className="text-white font-semibold text-base mb-1">{lang.title}</p>
                    <p className="text-blue-400 text-sm">{lang.level}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}
      </div>
    </section>
  );
}