'use client';

import { useSkills } from '@/lib/queries/useSkills';
import { SkillCategory } from './SkillCategory';

export function CompetencesList() {
  const { data: skills, isLoading } = useSkills();

  if (isLoading) {
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
      </div>
    </section>
  );
}