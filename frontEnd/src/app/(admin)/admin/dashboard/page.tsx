'use client';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useProfile } from '@/lib/queries/useProfile';
import { useProjects } from '@/lib/queries/useProjects';
import { useSkills } from '@/lib/queries/useSkills';
import { useNews } from '@/lib/queries/useNews';

export default function DashboardPage() {
  const { data: profile } = useProfile();
  const { data: projects } = useProjects();
  const { data: skills } = useSkills();
  const { data: news } = useNews();

  const stats = [
    { label: 'Projets', value: projects?.length ?? 0, color: 'text-blue-400' },
    { label: 'Compétences', value: skills?.length ?? 0, color: 'text-purple-400' },
    { label: 'Actualités', value: news?.length ?? 0, color: 'text-emerald-400' },
  ];

  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-slate-500 text-sm mb-8">
            Bonjour{profile ? `, ${profile.firstName} ${profile.lastName}` : ''} 👋
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-[#0a1128] border border-white/5 rounded-xl p-6">
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-slate-500 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}