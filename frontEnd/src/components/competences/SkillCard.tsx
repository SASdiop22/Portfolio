'use client';

import { motion } from 'framer-motion';
import type { Skill } from '@/lib/types';

interface Props {
  skill: Skill;
}

export function SkillCard({ skill }: Props) {
  return (
    <div className="bg-[#0a1128] border border-white/5 rounded-xl p-5 hover:border-blue-700/30 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        {skill.icon && (
          <span className="text-2xl leading-none">{skill.icon}</span>
        )}
        <span className="text-white font-medium text-sm flex-1">
          {skill.title}
        </span>
        <span className="text-xs text-slate-500">{skill.level}%</span>
      </div>
      <div className="w-full bg-[#05091a] rounded-full h-2 overflow-hidden">
        <motion.div
          className="bg-blue-700 h-2 rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.15, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}