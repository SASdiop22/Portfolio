import { SectionHero } from '@/components/ui/SectionHero';
import { ProjetsList } from '@/components/projets/ProjetsList';

export default function ProjetsPage() {
  return (
    <main className="pt-16">
      <SectionHero title="Mes Projets" />
      <ProjetsList />
    </main>
  );
}