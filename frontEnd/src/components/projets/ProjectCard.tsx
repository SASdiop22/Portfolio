'use client';

import Link from 'next/link';
import { GitBranch, ExternalLink } from 'lucide-react';
import { TechBadge } from './TechBadge';
import { cn } from '@/lib/utils';
import type { Project } from '@/lib/types';

interface Props {
  project: Project;
}

export function ProjectCard({ project }: Props) {
  return (
    <div
      className={cn(
        'bg-[#0a1128] border border-white/5 rounded-xl overflow-hidden transition-all duration-300',
        'hover:border-blue-700/30 hover:scale-[1.02]',
        project.featured && 'ring-2 ring-blue-700/40'
      )}
    >
      <Link href={`/projets/${project.id}`} className="block group">
        <div className="relative h-48 bg-gradient-to-br from-blue-900/20 to-[#05091a] overflow-hidden">
          {project.imageUrl && (
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
          )}
        </div>

        <div className="px-5 pt-5 pb-2">
          <h3 className="text-white font-semibold text-lg mb-2">
            {project.title}
          </h3>
          <p className="text-slate-400 text-sm mb-4 line-clamp-3">
            {project.description.length > 120
              ? `${project.description.slice(0, 120)}...`
              : project.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.technologies.slice(0, 4).map((tech) => (
              <TechBadge key={tech} label={tech} />
            ))}
            {project.technologies.length > 4 && (
              <span className="px-2 py-0.5 text-xs text-slate-500">
                +{project.technologies.length - 4}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="flex gap-3 px-5 pb-5">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <GitBranch size={18} />
          </a>
        )}
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <ExternalLink size={18} />
          </a>
        )}
      </div>
    </div>
  );
}