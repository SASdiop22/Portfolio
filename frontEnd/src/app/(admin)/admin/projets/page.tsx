'use client';
import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Upload, ImageIcon } from 'lucide-react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminFormField } from '@/components/admin/AdminFormField';
import { useProjects } from '@/lib/queries/useProjects';
import { api } from '@/lib/api';
import type { Project } from '@/lib/types';

type ProjectForm = {
  title: string;
  description: string;
  longDescription: string;
  technologies: string;
  imageUrl: string;
  demoUrl: string;
  githubUrl: string;
  featured: boolean;
  order: number;
};

const emptyForm: ProjectForm = {
  title: '',
  description: '',
  longDescription: '',
  technologies: '',
  imageUrl: '',
  demoUrl: '',
  githubUrl: '',
  featured: false,
  order: 0,
};

function toPayload(f: ProjectForm) {
  return {
    ...f,
    technologies: f.technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    imageUrl: f.imageUrl || undefined,
    demoUrl: f.demoUrl || undefined,
    githubUrl: f.githubUrl || undefined,
    longDescription: f.longDescription || undefined,
  };
}

function fromProject(p: Project): ProjectForm {
  return {
    title: p.title,
    description: p.description,
    longDescription: p.longDescription ?? '',
    technologies: p.technologies.join(', '),
    imageUrl: p.imageUrl ?? '',
    demoUrl: p.demoUrl ?? '',
    githubUrl: p.githubUrl ?? '',
    featured: p.featured,
    order: p.order,
  };
}

export default function ProjetsAdminPage() {
  const qc = useQueryClient();
  const { data: projects = [] } = useProjects();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModal(true);
  }

  function openEdit(p: Project) {
    setEditing(p);
    setForm(fromProject(p));
    setModal(true);
  }

  function closeModal() {
    setModal(false);
    setEditing(null);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? Number(value) : value,
    }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editing || !e.target.files?.[0]) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', e.target.files[0]);
      const { data } = await api.post<{ success: boolean; data: Project }>(
        `/projects/${editing.id}/image`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      setForm((f) => ({ ...f, imageUrl: data.data.imageUrl ?? '' }));
      await qc.invalidateQueries({ queryKey: ['projects'] });
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/projects/${editing.id}`, toPayload(form));
      } else {
        await api.post('/projects', toPayload(form));
      }
      await qc.invalidateQueries({ queryKey: ['projects'] });
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce projet ?')) return;
    await api.delete(`/projects/${id}`);
    await qc.invalidateQueries({ queryKey: ['projects'] });
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Projets</h1>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={15} />
              Ajouter
            </button>
          </div>
          <AdminTable<Project>
            columns={[
              { key: 'title', label: 'Titre' },
              {
                key: 'technologies',
                label: 'Stack',
                render: (p) => p.technologies.slice(0, 3).join(', '),
              },
              {
                key: 'featured',
                label: 'Mis en avant',
                render: (p) => (p.featured ? '⭐' : '—'),
              },
              { key: 'order', label: 'Ordre' },
            ]}
            data={projects}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </main>
      </div>

      <AdminModal
        isOpen={modal}
        onClose={closeModal}
        title={editing ? 'Modifier le projet' : 'Nouveau projet'}
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
            label="Description courte"
            name="description"
            value={form.description}
            onChange={handleChange}
            textarea
            rows={2}
            required
          />
          <AdminFormField
            label="Description longue"
            name="longDescription"
            value={form.longDescription}
            onChange={handleChange}
            textarea
            rows={5}
          />
          <AdminFormField
            label="Technologies (séparées par virgule)"
            name="technologies"
            value={form.technologies}
            onChange={handleChange}
            placeholder="React, Node.js, PostgreSQL"
            required
          />
          {/* Image upload — only available when editing an existing project */}
          {editing && (
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-400">Image du projet</label>
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="preview"
                  className="w-full h-36 object-cover rounded-lg opacity-80"
                />
              )}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  {uploading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Upload size={14} />
                  )}
                  {uploading ? 'Upload…' : 'Uploader une image'}
                </button>
                {form.imageUrl && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <ImageIcon size={12} /> Image définie
                  </span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          )}
          <AdminFormField
            label="URL image (ou coller une URL externe)"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="https://..."
          />
          <AdminFormField
            label="URL démo"
            name="demoUrl"
            value={form.demoUrl}
            onChange={handleChange}
            placeholder="https://..."
          />
          <AdminFormField
            label="URL GitHub"
            name="githubUrl"
            value={form.githubUrl}
            onChange={handleChange}
            placeholder="https://github.com/..."
          />
          <AdminFormField
            label="Mis en avant"
            name="featured"
            type="checkbox"
            value={form.featured}
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
              onClick={closeModal}
              className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2"
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