'use client';

import { GraduationCap, Briefcase, ExternalLink } from 'lucide-react';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import type { Education, Experience } from '@/lib/types';

type TimelineItem =
  | { type: 'education'; data: Education }
  | { type: 'experience'; data: Experience };

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

interface Props {
  item: TimelineItem;
  index: number;
}

export function TimelineEntry({ item, index }: Props) {
  const Icon = item.type === 'education' ? GraduationCap : Briefcase;

  const title =
    item.type === 'education'
      ? `${item.data.title}${item.data.specialization ? ` — ${item.data.specialization}` : ''}`
      : `${item.data.position}${item.data.title ? ` / ${item.data.title}` : ''}`;

  const subtitle =
    item.type === 'education'
      ? `${item.data.institution}, ${item.data.city}`
      : `${item.data.company}, ${item.data.city}`;

  const endLabel = item.data.current
    ? "Aujourd'hui"
    : item.data.endDate
    ? formatDate(item.data.endDate)
    : '';

  const period = `${formatDate(item.data.startDate)}${endLabel ? ` — ${endLabel}` : ''}`;

  const link =
    item.type === 'experience' ? item.data.link : null;

  return (
    <AnimatedSection delay={index * 0.07} className="relative pl-12 pb-12">
      <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-[#05091a] border-2 border-blue-700 flex items-center justify-center">
        <Icon size={14} className="text-blue-400" />
      </div>

      <div className="bg-[#0a1128] border border-white/5 rounded-xl p-6 hover:border-blue-700/20 transition-colors">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-white font-semibold text-lg leading-snug">{title}</h3>
          {item.data.current && (
            <span className="px-2 py-0.5 text-xs bg-green-900/30 text-green-400 border border-green-500/30 rounded-full shrink-0">
              Actuel
            </span>
          )}
        </div>
        <p className="text-blue-400 text-sm mb-1">{subtitle}</p>
        <p className="text-slate-500 text-xs mb-3">{period}</p>
        {item.data.description && (
          <p className="text-slate-400 text-sm">{item.data.description}</p>
        )}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-3 transition-colors"
          >
            Voir plus <ExternalLink size={12} />
          </a>
        )}
      </div>
    </AnimatedSection>
  );
}