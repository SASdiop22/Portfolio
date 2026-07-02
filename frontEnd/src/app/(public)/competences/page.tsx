import { SectionHero } from '@/components/ui/SectionHero';
import { CompetencesList } from '@/components/competences/CompetencesList';

export default function CompetencesPage() {
  return (
    <main className="pt-16">
      <SectionHero title="Mes Compétences" />
      <CompetencesList />
    </main>
  );
}