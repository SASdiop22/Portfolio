import { HeroSection } from '@/components/home/HeroSection';
import { AboutSection } from '@/components/home/AboutSection';
import { SkillsPreview } from '@/components/home/SkillsPreview';
import { ProjectsPreview } from '@/components/home/ProjectsPreview';
import { CTASection } from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <SkillsPreview />
      <ProjectsPreview />
      <CTASection />
    </main>
  );
}