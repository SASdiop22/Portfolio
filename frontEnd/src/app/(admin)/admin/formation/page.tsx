'use client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminFormField } from '@/components/admin/AdminFormField';
import { useEducation } from '@/lib/queries/useEducation';
import { api } from '@/lib/api';
import type { Education } from '@/lib/types';

type EduForm = {
  institution: string;
  city: string;
  title: string;
  specialization: string;
  description: string;
  startDate: string;
  endDate: string;
  current: boolean;
  order: number;
};

const emptyForm: EduForm = {
  institution: '',
  city: '',
  title: '',
  specialization: '',
  description: '',
  startDate: '',
  endDate: '',
  current: false,
  order: 0,
};

function fromEdu(e: Education): EduForm {
  return {
    institution: e.institution,
    city: e.city,
    title: e.title,
    specialization: e.specialization,
    description: e.description,
    startDate: e.startDate.slice(0, 10),
    endDate: e.endDate?.slice(0, 10) ?? '',
    current: e.current,
    order: e.order,
  };
}

function toPayload(f: EduForm) {
  return { ...f, endDate: f.endDate || undefined };
}

export default function FormationAdminPage() {
  const qc = useQueryClient();
  const { data: educations = [] } = useEducation();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Education | null>(null);
  const [form, setForm] = useState<EduForm>(emptyForm);
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
        await api.put(`/education/${editing.id}`, toPayload(form));
      } else {
        await api.post('/education', toPayload(form));
      }
      await qc.invalidateQueries({ queryKey: ['education'] });
      setModal(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ?')) return;
    await api.delete(`/education/${id}`);
    await qc.invalidateQueries({ queryKey: ['education'] });
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Formations</h1>
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
          <AdminTable<Education>
            columns={[
              { key: 'institution', label: 'Établissement' },
              { key: 'title', label: 'Diplôme' },
              { key: 'specialization', label: 'Spécialisation' },
              { key: 'startDate', label: 'Début', render: (e) => e.startDate.slice(0, 7) },
              { key: 'current', label: 'En cours', render: (e) => (e.current ? '✓' : '—') },
            ]}
            data={educations}
            onEdit={(e) => {
              setEditing(e);
              setForm(fromEdu(e));
              setModal(true);
            }}
            onDelete={handleDelete}
          />
        </main>
      </div>

      <AdminModal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Modifier' : 'Nouvelle formation'}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <AdminFormField
            label="Établissement"
            name="institution"
            value={form.institution}
            onChange={handleChange}
            required
          />
          <AdminFormField
            label="Ville"
            name="city"
            value={form.city}
            onChange={handleChange}
            required
          />
          <AdminFormField
            label="Diplôme"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Master MIAGE"
          />
          <AdminFormField
            label="Spécialisation"
            name="specialization"
            value={form.specialization}
            onChange={handleChange}
            required
            placeholder="Cybersécurité"
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