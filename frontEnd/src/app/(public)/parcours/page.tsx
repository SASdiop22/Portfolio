import { SectionHero } from '@/components/ui/SectionHero';
import { Timeline } from '@/components/parcours/Timeline';

export default function ParcoursPage() {
  return (
    <main className="pt-16">
      <SectionHero title="Mon Parcours" />
      <Timeline />
    </main>
  );
}