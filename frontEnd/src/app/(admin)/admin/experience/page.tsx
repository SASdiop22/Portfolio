'use client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminFormField } from '@/components/admin/AdminFormField';
import { useExperiences } from '@/lib/queries/useExperiences';
import { api } from '@/lib/api';
import type { Experience } from '@/lib/types';

type ExpForm = {
  company: string;
  position: string;
  title: string;
  city: string;
  description: string;
  startDate: string;
  endDate: string;
  current: boolean;
  link: string;
  order: number;
};

const emptyForm: ExpForm = {
  company: '',
  position: '',
  title: '',
  city: '',
  description: '',
  startDate: '',
  endDate: '',
  current: false,
  link: '',
  order: 0,
};

function fromExp(e: Experience): ExpForm {
  return {
    company: e.company,
    position: e.position,
    title: e.title,
    city: e.city,
    description: e.description,
    startDate: e.startDate.slice(0, 10),
    endDate: e.endDate?.slice(0, 10) ?? '',
    current: e.current,
    link: e.link ?? '',
    order: e.order,
  };
}

function toPayload(f: ExpForm) {
  return {
    ...f,
    endDate: f.endDate || undefined,
    link: f.link || undefined,
  };
}

export default function ExperienceAdminPage() {
  const qc = useQueryClient();
  const { data: experiences = [] } = useExperiences();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [form, setForm] = useState<ExpForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
            ? Number(value)
            : value,
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/experience/${editing.id}`, toPayload(form));
      } else {
        await api.post('/experience', toPayload(form));
      }
      await qc.invalidateQueries({ queryKey: ['experiences'] });
      setModal(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ?')) return;
    await api.delete(`/experience/${id}`);
    await qc.invalidateQueries({ queryKey: ['experiences'] });
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Expériences</h1>
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
          <AdminTable<Experience>
            columns={[
              { key: 'company', label: 'Entreprise' },
              { key: 'position', label: 'Poste' },
              { key: 'startDate', label: 'Début', render: (e) => e.startDate.slice(0, 10) },
              { key: 'current', label: 'En cours', render: (e) => (e.current ? '✓' : '—') },
              { key: 'order', label: 'Ordre' },
            ]}
            data={experiences}
            onEdit={(e) => {
              setEditing(e);
              setForm(fromExp(e));
              setModal(true);
            }}
            onDelete={handleDelete}
          />
        </main>
      </div>

      <AdminModal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Modifier' : 'Nouvelle expérience'}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <AdminFormField
            label="Entreprise"
            name="company"
            value={form.company}
            onChange={handleChange}
            required
          />
          <AdminFormField
            label="Poste"
            name="position"
            value={form.position}
            onChange={handleChange}
            required
            placeholder="Stagiaire Fullstack"
          />
          <AdminFormField
            label="Sous-titre"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Développement API REST"
          />
          <AdminFormField
            label="Ville"
            name="city"
            value={form.city}
            onChange={handleChange}
            required
          />
          <AdminFormField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            textarea
            rows={3}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <AdminFormField
              label="Date début"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              required
            />
            <AdminFormField
              label="Date fin"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
            />
          </div>
          <AdminFormField
            label="En cours"
            name="current"
            type="checkbox"
            value={form.current}
            onChange={handleChange}
          />
          <AdminFormField
            label="Lien"
            name="link"
            value={form.link}
            onChange={handleChange}
            placeholder="https://..."
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