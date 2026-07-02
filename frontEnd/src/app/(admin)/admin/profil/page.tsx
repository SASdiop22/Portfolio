'use client';
import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminFormField } from '@/components/admin/AdminFormField';
import { useProfile } from '@/lib/queries/useProfile';
import { api } from '@/lib/api';

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  desiredPosition: string;
  tagline: string;
  city: string;
  mobility: string;
  phone: string;
  ctaTitle: string;
  ctaText: string;
};

const emptyForm: ProfileForm = {
  firstName: '',
  lastName: '',
  email: '',
  desiredPosition: '',
  tagline: '',
  city: '',
  mobility: '',
  phone: '',
  ctaTitle: '',
  ctaText: '',
};

export default function ProfilPage() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        desiredPosition: profile.desiredPosition,
        tagline: profile.tagline,
        city: profile.city,
        mobility: profile.mobility,
        phone: profile.phone,
        ctaTitle: profile.ctaTitle ?? '',
        ctaText: profile.ctaText ?? '',
      });
    }
  }, [profile]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await api.put('/users/profile', form);
      await qc.invalidateQueries({ queryKey: ['profile'] });
      setMsg('Profil mis à jour avec succès.');
    } catch {
      setMsg('Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg('');
    try {
      const fd = new FormData();
      fd.append('photo', file);
      await api.post('/users/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await qc.invalidateQueries({ queryKey: ['profile'] });
      setMsg('Photo mise à jour.');
    } catch {
      setMsg('Erreur upload photo.');
    } finally {
      setUploading(false);
    }
  }

  const initials = `${form.firstName[0] ?? ''}${form.lastName[0] ?? ''}`.toUpperCase();

  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 max-w-2xl">
          <h1 className="text-2xl font-bold text-white mb-6">Profil</h1>

          <div className="bg-[#0a1128] border border-white/5 rounded-xl p-5 mb-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-[#05091a] border border-white/10 flex items-center justify-center text-xl font-black text-blue-500 overflow-hidden shrink-0">
              {profile?.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.photo} alt="photo" className="w-full h-full object-cover" />
              ) : (
                initials || '?'
              )}
            </div>
            <div>
              <p className="text-white text-sm font-medium mb-1">Photo de profil</p>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
              >
                {uploading ? 'Upload en cours...' : 'Changer la photo'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>
          </div>

          <form
            onSubmit={handleSave}
            className="bg-[#0a1128] border border-white/5 rounded-xl p-5 flex flex-col gap-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <AdminFormField
                label="Prénom"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />
              <AdminFormField
                label="Nom"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <AdminFormField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <AdminFormField
              label="Poste souhaité"
              name="desiredPosition"
              value={form.desiredPosition}
              onChange={handleChange}
              required
            />
            <AdminFormField
              label="Tagline (bio)"
              name="tagline"
              value={form.tagline}
              onChange={handleChange}
              textarea
              rows={2}
            />
            <div className="grid grid-cols-2 gap-4">
              <AdminFormField label="Ville" name="city" value={form.city} onChange={handleChange} />
              <AdminFormField
                label="Mobilité"
                name="mobility"
                value={form.mobility}
                onChange={handleChange}
              />
            </div>
            <AdminFormField
              label="Téléphone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
            />
            <AdminFormField
              label="Titre CTA"
              name="ctaTitle"
              value={form.ctaTitle}
              onChange={handleChange}
            />
            <AdminFormField
              label="Texte CTA"
              name="ctaText"
              value={form.ctaText}
              onChange={handleChange}
              textarea
              rows={2}
            />
            {msg && (
              <p className={`text-xs ${msg.includes('Erreur') ? 'text-red-400' : 'text-green-400'}`}>
                {msg}
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>
        </main>
      </div>
    </AdminGuard>
  );
}