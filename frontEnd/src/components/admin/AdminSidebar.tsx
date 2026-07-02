'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LogOut,
  User,
  Briefcase,
  GraduationCap,
  Newspaper,
  Link2,
  LayoutDashboard,
  Code,
} from 'lucide-react';
import { logout } from '@/lib/admin/auth';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/profil', label: 'Profil', icon: User },
  { href: '/admin/projets', label: 'Projets', icon: Code },
  { href: '/admin/competences', label: 'Compétences', icon: Briefcase },
  { href: '/admin/experience', label: 'Expériences', icon: Briefcase },
  { href: '/admin/formation', label: 'Formations', icon: GraduationCap },
  { href: '/admin/actualites', label: 'Actualités', icon: Newspaper },
  { href: '/admin/liens', label: 'Liens sociaux', icon: Link2 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/admin');
  }

  return (
    <aside className="w-56 shrink-0 bg-[#0a1128] border-r border-white/5 min-h-screen flex flex-col">
      <div className="px-6 py-5 border-b border-white/5">
        <p className="text-white font-bold text-sm">Admin</p>
        <p className="text-blue-400 text-xs mt-0.5">Portfolio</p>
      </div>
      <nav className="flex-1 py-4 flex flex-col gap-0.5 px-3">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === href
                ? 'bg-blue-700/20 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 w-full transition-colors"
        >
          <LogOut size={15} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}