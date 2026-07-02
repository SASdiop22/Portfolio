import { HeroSection } from '@/components/home/HeroSection';
import { AboutSection } from '@/components/home/AboutSection';
import { SkillsPreview } from '@/components/home/SkillsPreview';
import { ProjectsPreview } from '@/components/home/ProjectsPreview';

function CTASection() {
  return (
    <section className="py-24 bg-[#05091a] text-center">
      <div className="max-w-2xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-white mb-4">
          Travaillons ensemble
        </h2>
        <p className="text-slate-400 mb-8">
          Je suis disponible pour des opportunités freelance ou en CDI.
        </p>
        <a
          href="mailto:serigneasdiop@gmail.com"
          className="inline-block px-10 py-4 bg-blue-700 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors text-lg"
        >
          Me contacter
        </a>
      </div>
    </section>
  );
}

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