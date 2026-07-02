'use client';

import { useEducation } from '@/lib/queries/useEducation';
import { useExperiences } from '@/lib/queries/useExperiences';
import { TimelineEntry } from './TimelineEntry';
import type { Education, Experience } from '@/lib/types';

type TimelineItem =
  | { type: 'education'; data: Education }
  | { type: 'experience'; data: Experience };

export function Timeline() {
  const { data: education } = useEducation();
  const { data: experiences } = useExperiences();

  const items: TimelineItem[] = [
    ...(education?.map((d) => ({ type: 'education' as const, data: d })) ?? []),
    ...(experiences?.map((d) => ({ type: 'experience' as const, data: d })) ?? []),
  ].sort(
    (a, b) =>
      new Date(b.data.startDate).getTime() -
      new Date(a.data.startDate).getTime()
  );

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        Aucune entrée pour le moment.
      </div>
    );
  }

  return (
    <section className="py-24 bg-[#05091a]">
      <div className="max-w-3xl mx-auto px-6">
        <div className="relative border-l-2 border-blue-700/30 ml-4">
          {items.map((item, i) => (
            <TimelineEntry
              key={`${item.type}-${item.data.id}`}
              item={item}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}