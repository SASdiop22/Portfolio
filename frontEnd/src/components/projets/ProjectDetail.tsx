'use client';

import { GitBranch, ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { TechBadge } from './TechBadge';
import { useProject } from '@/lib/queries/useProjects';

interface Props {
  id: string;
}

export function ProjectDetail({ id }: Props) {
  const { data: project, isLoading } = useProject(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05091a] flex items-center justify-center text-slate-500">
        Chargement...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#05091a] flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Projet introuvable.</p>
        <Link href="/projets" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
          ← Retour aux projets
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#05091a] min-h-screen">
      <div className="relative h-72 md:h-96 bg-gradient-to-br from-blue-900/20 to-[#05091a] overflow-hidden">
        {project.imageUrl && (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05091a] via-[#05091a]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-4xl mx-auto px-6 pb-8">
          <h1 className="text-5xl md:text-6xl font-black text-white">
            {project.title}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link
          href="/projets"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft size={14} /> Retour aux projets
        </Link>

        <div className="flex flex-wrap gap-2 mb-10">
          {project.technologies.map((tech) => (
            <TechBadge key={tech} label={tech} />
          ))}
        </div>

        <div className="prose prose-invert prose-slate max-w-none mb-12 text-slate-300">
          <p className="text-lg leading-relaxed">
            {project.longDescription || project.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
            >
              <ExternalLink size={18} /> Voir la démo
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-blue-700/50 hover:border-blue-700 text-slate-300 hover:text-white rounded-lg transition-colors font-medium"
            >
              <GitBranch size={18} /> GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  );
}