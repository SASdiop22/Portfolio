'use client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminFormField } from '@/components/admin/AdminFormField';
import { useSkills } from '@/lib/queries/useSkills';
import { useLanguages } from '@/lib/queries/useLanguages';
import { api } from '@/lib/api';
import type { Skill, Language } from '@/lib/types';

type SkillForm = { title: string; category: string; level: number; icon: string; order: number };
type LangForm = { title: string; level: string; order: number };

const emptySkill: SkillForm = { title: '', category: '', level: 50, icon: '', order: 0 };
const emptyLang: LangForm = { title: '', level: '', order: 0 };

function fromSkill(s: Skill): SkillForm {
  return { title: s.title, category: s.category, level: s.level, icon: s.icon ?? '', order: s.order };
}
function fromLang(l: Language): LangForm {
  return { title: l.title, level: l.level, order: l.order };
}

export default function CompetencesAdminPage() {
  const qc = useQueryClient();
  const { data: skills = [] } = useSkills();
  const { data: languages = [] } = useLanguages();

  const [skillModal, setSkillModal] = useState(false);
  const [editSkill, setEditSkill] = useState<Skill | null>(null);
  const [skillForm, setSkillForm] = useState<SkillForm>(emptySkill);
  const [savingSkill, setSavingSkill] = useState(false);

  const [langModal, setLangModal] = useState(false);
  const [editLang, setEditLang] = useState<Language | null>(null);
  const [langForm, setLangForm] = useState<LangForm>(emptyLang);
  const [savingLang, setSavingLang] = useState(false);

  function handleSkillChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setSkillForm((f) => ({ ...f, [name]: type === 'number' ? Number(value) : value }));
  }

  function handleLangChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setLangForm((f) => ({ ...f, [name]: type === 'number' ? Number(value) : value }));
  }

  async function saveSkill(e: React.FormEvent) {
    e.preventDefault();
    setSavingSkill(true);
    try {
      const payload = { ...skillForm, icon: skillForm.icon || undefined };
      if (editSkill) {
        await api.put(`/skills/${editSkill.id}`, payload);
      } else {
        await api.post('/skills', payload);
      }
      await qc.invalidateQueries({ queryKey: ['skills'] });
      setSkillModal(false);
    } finally {
      setSavingSkill(false);
    }
  }

  async function deleteSkill(id: string) {
    if (!confirm('Supprimer ?')) return;
    await api.delete(`/skills/${id}`);
    await qc.invalidateQueries({ queryKey: ['skills'] });
  }

  async function saveLang(e: React.FormEvent) {
    e.preventDefault();
    setSavingLang(true);
    try {
      if (editLang) {
        await api.put(`/languages/${editLang.id}`, langForm);
      } else {
        await api.post('/languages', langForm);
      }
      await qc.invalidateQueries({ queryKey: ['languages'] });
      setLangModal(false);
    } finally {
      setSavingLang(false);
    }
  }

  async function deleteLang(id: string) {
    if (!confirm('Supprimer ?')) return;
    await api.delete(`/languages/${id}`);
    await qc.invalidateQueries({ queryKey: ['languages'] });
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 flex flex-col gap-10">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-white">Compétences</h1>
              <button
                onClick={() => {
                  setEditSkill(null);
                  setSkillForm(emptySkill);
                  setSkillModal(true);
                }}
                className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={15} />
                Ajouter
              </button>
            </div>
            <AdminTable<Skill>
              columns={[
                { key: 'icon', label: 'Icône' },
                { key: 'title', label: 'Nom' },
                { key: 'category', label: 'Catégorie' },
                { key: 'level', label: 'Niveau' },
                { key: 'order', label: 'Ordre' },
              ]}
              data={skills}
              onEdit={(s) => {
                setEditSkill(s);
                setSkillForm(fromSkill(s));
                setSkillModal(true);
              }}
              onDelete={deleteSkill}
            />
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Langues</h2>
              <button
                onClick={() => {
                  setEditLang(null);
                  setLangForm(emptyLang);
                  setLangModal(true);
                }}
                className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={15} />
                Ajouter
              </button>
            </div>
            <AdminTable<Language>
              columns={[
                { key: 'title', label: 'Langue' },
                { key: 'level', label: 'Niveau' },
                { key: 'order', label: 'Ordre' },
              ]}
              data={languages}
              onEdit={(l) => {
                setEditLang(l);
                setLangForm(fromLang(l));
                setLangModal(true);
              }}
              onDelete={deleteLang}
            />
          </section>
        </main>
      </div>

      <AdminModal
        isOpen={skillModal}
        onClose={() => setSkillModal(false)}
        title={editSkill ? 'Modifier la compétence' : 'Nouvelle compétence'}
      >
        <form onSubmit={saveSkill} className="flex flex-col gap-4">
          <AdminFormField
            label="Nom"
            name="title"
            value={skillForm.title}
            onChange={handleSkillChange}
            required
          />
          <AdminFormField
            label="Catégorie"
            name="category"
            value={skillForm.category}
            onChange={handleSkillChange}
            required
            placeholder="Frontend, Backend, DevOps..."
          />
          <AdminFormField
            label="Icône (emoji)"
            name="icon"
            value={skillForm.icon}
            onChange={handleSkillChange}
            placeholder="⚛️"
          />
          <AdminFormField
            label="Niveau (0-100)"
            name="level"
            type="number"
            value={skillForm.level}
            onChange={handleSkillChange}
          />
          <AdminFormField
            label="Ordre"
            name="order"
            type="number"
            value={skillForm.order}
            onChange={handleSkillChange}
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSkillModal(false)}
              className="text-sm text-slate-400 hover:text-white px-4 py-2 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={savingSkill}
              className="bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              {savingSkill ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        isOpen={langModal}
        onClose={() => setLangModal(false)}
        title={editLang ? 'Modifier la langue' : 'Nouvelle langue'}
      >
        <form onSubmit={saveLang} className="flex flex-col gap-4">
          <AdminFormField
            label="Langue"
            name="title"
            value={langForm.title}
            onChange={handleLangChange}
            required
            placeholder="Français"
          />
          <AdminFormField
            label="Niveau"
            name="level"
            value={langForm.level}
            onChange={handleLangChange}
            required
            placeholder="Bilingue, B2, A2..."
          />
          <AdminFormField
            label="Ordre"
            name="order"
            type="number"
            value={langForm.order}
            onChange={handleLangChange}
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setLangModal(false)}
              className="text-sm text-slate-400 hover:text-white px-4 py-2 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={savingLang}
              className="bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              {savingLang ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </AdminModal>
    </AdminGuard>
  );
}