import { SectionHero } from '@/components/ui/SectionHero';
import { NewsList } from '@/components/actualites/NewsList';

export default function ActualitesPage() {
  return (
    <main className="pt-16">
      <SectionHero title="Actualités" />
      <NewsList />
    </main>
  );
}