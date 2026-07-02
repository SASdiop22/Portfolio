import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { SkillCard } from './SkillCard';
import type { Skill } from '@/lib/types';

interface Props {
  category: string;
  skills: Skill[];
}

export function SkillCategory({ category, skills }: Props) {
  return (
    <div className="mb-14">
      <h2 className="text-2xl font-bold text-white mb-6 capitalize">
        {category}
      </h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {skills.map((skill, i) => (
          <AnimatedSection key={skill.id} delay={i * 0.04}>
            <SkillCard skill={skill} />
          </AnimatedSection>
        ))}
      </div>
    </div>
  );
}