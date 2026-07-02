'use client';

import Link from 'next/link';
import { useSocialLinks } from '@/lib/queries/useSocialLinks';
import { useProfile } from '@/lib/queries/useProfile';

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/parcours', label: 'Parcours' },
  { href: '/projets', label: 'Projets' },
  { href: '/competences', label: 'Compétences' },
  { href: '/actualites', label: 'Actualités' },
];

export function Footer() {
  const { data: profile } = useProfile();
  const { data: socialLinks } = useSocialLinks();

  return (
    <footer className="bg-[#0a0f1e] border-t border-white/5 py-12">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
        <div>
          <p className="text-lg font-bold text-white mb-2">
            {profile ? `${profile.firstName} ${profile.lastName}` : 'Portfolio'}
          </p>
          {profile?.tagline && (
            <p className="text-slate-500 text-sm">{profile.tagline}</p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Navigation
          </p>
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Réseaux
          </p>
          <div className="flex flex-wrap gap-3">
            {socialLinks?.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                {link.logo ? (
                  <img src={link.logo} alt={link.platform} className="w-5 h-5" />
                ) : (
                  link.platform
                )}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10 pt-6 border-t border-white/5">
        <p className="text-xs text-slate-600 text-center">
          © {new Date().getFullYear()} {profile?.firstName} {profile?.lastName}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}