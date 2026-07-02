import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { SkillCard } from './SkillCard';
import type { Skill } from '@/lib/types';

interface Props {
  readonly category: string;
  readonly skills: Skill[];
}

export function SkillCategory({ category, skills }: Props) {
  return (
    <div className="mb-14">
      <h2 className="text-xl font-semibold text-white mb-5 capitalize tracking-wide">
        {category}
      </h2>
      <AnimatedSection delay={0.05}>
        <div className="flex flex-wrap gap-3">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </AnimatedSection>
    </div>
  );
}