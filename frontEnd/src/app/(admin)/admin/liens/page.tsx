'use client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminFormField } from '@/components/admin/AdminFormField';
import { useSocialLinks } from '@/lib/queries/useSocialLinks';
import { api } from '@/lib/api';
import type { SocialLink } from '@/lib/types';

type LinkForm = { platform: string; url: string; order: number };

const emptyForm: LinkForm = { platform: '', url: '', order: 0 };

function fromLink(l: SocialLink): LinkForm {
  return { platform: l.platform, url: l.url, order: l.order };
}

export default function LiensAdminPage() {
  const qc = useQueryClient();
  const { data: links = [] } = useSocialLinks();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [form, setForm] = useState<LinkForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'number' ? Number(value) : value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/social-links/${editing.id}`, form);
      } else {
        await api.post('/social-links', form);
      }
      await qc.invalidateQueries({ queryKey: ['social-links'] });
      setModal(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ?')) return;
    await api.delete(`/social-links/${id}`);
    await qc.invalidateQueries({ queryKey: ['social-links'] });
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Liens sociaux</h1>
            <button
              onClick={() => {
                setEditing(null);
                setForm(emptyForm);
                setModal(true);
              }}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={15} />
              Ajouter
            </button>
          </div>
          <AdminTable<SocialLink>
            columns={[
              { key: 'platform', label: 'Plateforme' },
              { key: 'url', label: 'URL' },
              { key: 'order', label: 'Ordre' },
            ]}
            data={links}
            onEdit={(l) => {
              setEditing(l);
              setForm(fromLink(l));
              setModal(true);
            }}
            onDelete={handleDelete}
          />
        </main>
      </div>

      <AdminModal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Modifier' : 'Nouveau lien'}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <AdminFormField
            label="Plateforme"
            name="platform"
            value={form.platform}
            onChange={handleChange}
            required
            placeholder="LinkedIn, GitHub, GitLab..."
          />
          <AdminFormField
            label="URL"
            name="url"
            value={form.url}
            onChange={handleChange}
            required
            placeholder="https://linkedin.com/in/..."
          />
          <AdminFormField
            label="Ordre"
            name="order"
            type="number"
            value={form.order}
            onChange={handleChange}
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModal(false)}
              className="text-sm text-slate-400 hover:text-white px-4 py-2 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </AdminModal>
    </AdminGuard>
  );
}