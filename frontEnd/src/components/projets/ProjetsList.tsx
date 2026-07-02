'use client';

import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { ProjectCard } from './ProjectCard';
import { useProjects } from '@/lib/queries/useProjects';

export function ProjetsList() {
  const { data: projects, isLoading } = useProjects();

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
        Chargement...
      </div>
    );
  }

  if (!projects?.length) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
        Aucun projet pour le moment.
      </div>
    );
  }

  return (
    <section className="py-24 bg-[#05091a]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <AnimatedSection key={project.id} delay={i * 0.05}>
              <ProjectCard project={project} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}