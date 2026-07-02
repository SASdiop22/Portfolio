'use client';

import type { Skill } from '@/lib/types';

interface Props {
  readonly skill: Skill;
}

export function SkillCard({ skill }: Props) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0a1128] border border-white/5 rounded-full text-sm text-slate-300 font-medium hover:border-blue-700/40 hover:text-white transition-colors cursor-default">
      {skill.icon && <span className="text-base leading-none">{skill.icon}</span>}
      {skill.title}
    </span>
  );
}