'use client';

import { GitBranch, ExternalLink, ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import DOMPurify from 'isomorphic-dompurify';
import { TechBadge } from './TechBadge';
import { useProject } from '@/lib/queries/useProjects';

interface Props {
  readonly id: string;
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
      {/* Hero */}
      <div className="relative min-h-[50vh] flex flex-col justify-end overflow-hidden">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/60 via-[#05091a] to-[#0a1128]" />
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-700/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-900/15 rounded-full blur-3xl" />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05091a] via-[#05091a]/50 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-28 pb-14 w-full">
          <Link
            href="/projets"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Retour aux projets
          </Link>

          {project.featured && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-700/20 border border-blue-700/30 rounded-full text-blue-400 text-xs font-medium mb-4"
            >
              <Star size={11} fill="currentColor" /> Projet mis en avant
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4"
          >
            {project.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-lg text-slate-400 max-w-2xl"
          >
            {project.description}
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Tech badges */}
        <div className="flex flex-wrap gap-2 mb-10 pb-10 border-b border-white/5">
          {project.technologies.map((tech) => (
            <TechBadge key={tech} label={tech} />
          ))}
        </div>

        {/* Long description — rendered HTML */}
        {(project.longDescription || project.description) && (
          <div
            className="prose prose-invert prose-slate max-w-none mb-12
              prose-p:text-slate-300 prose-p:leading-relaxed
              prose-strong:text-white prose-strong:font-semibold
              prose-li:text-slate-300 prose-ul:my-4
              prose-headings:text-white"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(project.longDescription || project.description),
            }}
          />
        )}

        {/* Actions */}
        {(project.githubUrl || project.demoUrl) && (
          <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
              >
                <GitBranch size={18} /> GitHub
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-blue-700/50 hover:border-blue-700 text-slate-300 hover:text-white rounded-lg transition-colors font-medium"
              >
                <ExternalLink size={18} /> Voir la démo
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}