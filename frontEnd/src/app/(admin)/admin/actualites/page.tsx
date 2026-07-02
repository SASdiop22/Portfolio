'use client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminFormField } from '@/components/admin/AdminFormField';
import { useNews } from '@/lib/queries/useNews';
import { api } from '@/lib/api';
import type { News } from '@/lib/types';

type NewsForm = {
  title: string;
  summary: string;
  content: string;
  category: string;
  imageUrl: string;
  publishedAt: string;
  order: number;
};

const emptyForm: NewsForm = {
  title: '',
  summary: '',
  content: '',
  category: '',
  imageUrl: '',
  publishedAt: new Date().toISOString().slice(0, 10),
  order: 0,
};

function fromNews(n: News): NewsForm {
  return {
    title: n.title,
    summary: n.summary,
    content: n.content,
    category: n.category,
    imageUrl: n.imageUrl ?? '',
    publishedAt: n.publishedAt.slice(0, 10),
    order: n.order,
  };
}

function toPayload(f: NewsForm) {
  return {
    ...f,
    imageUrl: f.imageUrl || undefined,
    publishedAt: new Date(f.publishedAt).toISOString(),
  };
}

export default function ActualitesAdminPage() {
  const qc = useQueryClient();
  const { data: news = [] } = useNews();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<News | null>(null);
  const [form, setForm] = useState<NewsForm>(emptyForm);
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
        await api.put(`/news/${editing.id}`, toPayload(form));
      } else {
        await api.post('/news', toPayload(form));
      }
      await qc.invalidateQueries({ queryKey: ['news'] });
      setModal(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ?')) return;
    await api.delete(`/news/${id}`);
    await qc.invalidateQueries({ queryKey: ['news'] });
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Actualités</h1>
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
          <AdminTable<News>
            columns={[
              { key: 'title', label: 'Titre' },
              { key: 'category', label: 'Catégorie' },
              {
                key: 'publishedAt',
                label: 'Publié le',
                render: (n) => n.publishedAt.slice(0, 10),
              },
              { key: 'order', label: 'Ordre' },
            ]}
            data={news}
            onEdit={(n) => {
              setEditing(n);
              setForm(fromNews(n));
              setModal(true);
            }}
            onDelete={handleDelete}
          />
        </main>
      </div>

      <AdminModal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Modifier' : "Nouvelle actualité"}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <AdminFormField
            label="Titre"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
          <AdminFormField
            label="Catégorie"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            placeholder="Actualité professionnelle"
          />
          <AdminFormField
            label="Résumé"
            name="summary"
            value={form.summary}
            onChange={handleChange}
            textarea
            rows={2}
            required
          />
          <AdminFormField
            label="Contenu"
            name="content"
            value={form.content}
            onChange={handleChange}
            textarea
            rows={6}
            required
          />
          <AdminFormField
            label="URL image"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="https://..."
          />
          <AdminFormField
            label="Date de publication"
            name="publishedAt"
            type="date"
            value={form.publishedAt}
            onChange={handleChange}
            required
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