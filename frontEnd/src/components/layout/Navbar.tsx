'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useProfile } from '@/lib/queries/useProfile';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Accueil' },
  { href: '/parcours', label: 'Parcours' },
  { href: '/projets', label: 'Projets' },
  { href: '/competences', label: 'Compétences' },
  { href: '/actualites', label: 'Actualités' },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: profile } = useProfile();
  const [open, setOpen] = useState(false);

  const initials = profile
    ? `${profile.firstName[0]}${profile.lastName[0]}`
    : 'AS';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/70 border-b border-white/5">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-blue-700 tracking-tight">
          {initials}
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <li key={link.href} className="relative">
              <Link
                href={link.href}
                className={cn(
                  'text-sm transition-colors',
                  pathname === link.href
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {link.label}
              </Link>
              {pathname === link.href && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute -bottom-px left-0 right-0 h-0.5 bg-blue-700"
                />
              )}
            </li>
          ))}
        </ul>

        <button
          className="md:hidden text-slate-400 hover:text-white transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed inset-y-0 right-0 w-64 bg-[#0a1128] border-l border-white/5 z-50 flex flex-col pt-20 px-6 gap-6"
          >
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
            >
              <X size={24} />
            </button>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'text-lg transition-colors',
                  pathname === link.href
                    ? 'text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}