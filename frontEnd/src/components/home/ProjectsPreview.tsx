'use client';

import Link from 'next/link';
import { GitFork, ExternalLink } from 'lucide-react';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { useProjects } from '@/lib/queries/useProjects';

export function ProjectsPreview() {
  const { data: projects } = useProjects();

  const featured = projects
    ? (projects.filter((p) => p.featured).length > 0
        ? projects.filter((p) => p.featured)
        : projects
      ).slice(0, 3)
    : [];

  return (
    <section className="py-24 bg-[#0a1128]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-white">Mes Projets</h2>
          <Link
            href="/projets"
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            Voir tout →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {featured.map((project, i) => (
            <AnimatedSection key={project.id} delay={i * 0.1}>
              <Link href={`/projets/${project.id}`} className="block group">
                <div className="bg-[#05091a] border border-white/5 rounded-xl overflow-hidden hover:border-blue-700/30 transition-colors">
                  <div className="h-48 bg-gradient-to-br from-blue-900/20 to-[#05091a] relative overflow-hidden">
                    {project.imageUrl && (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-white font-semibold mb-2">
                      {project.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 text-xs bg-blue-700/15 text-blue-400 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div
                      className="flex gap-3"
                      onClick={(e) => e.preventDefault()}
                    >
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:text-white transition-colors"
                        >
                          <GitFork size={16} />
                        </a>
                      )}
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:text-white transition-colors"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}