'use client';

import Image from 'next/image';
import { MapPin, MoveRight, Phone, Mail, ExternalLink, GitFork } from 'lucide-react';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { useProfile } from '@/lib/queries/useProfile';
import { useSocialLinks } from '@/lib/queries/useSocialLinks';

function SocialIcon({ platform }: { readonly platform: string }) {
  if (platform === 'GitHub' || platform === 'GitLab') return <GitFork size={16} />;
  return <ExternalLink size={16} />;
}

export function AboutSection() {
  const { data: profile } = useProfile();
  const { data: socialLinks } = useSocialLinks();

  if (!profile) return null;

  const initials = `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`;

  return (
    <section className="py-24 bg-[#0a1128]">
      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-12">

        {/* Ligne haut : photo + infos */}
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* Photo / initiales */}
          <AnimatedSection delay={0} className="flex justify-center">
            <div className="relative w-64 h-64 md:w-72 md:h-72">
              {profile.photo ? (
                <Image
                  src={profile.photo}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  fill
                  className="object-cover rounded-2xl ring-2 ring-blue-700/50"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-[#05091a] ring-2 ring-blue-700/40 flex items-center justify-center">
                  <span className="text-7xl font-black text-blue-700 tracking-tight select-none">
                    {initials}
                  </span>
                </div>
              )}
              <div className="absolute -inset-4 rounded-3xl bg-blue-700/5 blur-2xl -z-10" />
            </div>
          </AnimatedSection>

          {/* Infos */}
          <AnimatedSection delay={0.15} className="flex flex-col gap-5">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-blue-400 text-lg mt-1">{profile.desiredPosition}</p>
            </div>

            {/* Coordonnées */}
            <div className="space-y-2 text-slate-400 text-sm">
              {profile.city && (
                <p className="flex items-center gap-2">
                  <MapPin size={15} className="text-blue-700 shrink-0" />
                  {profile.city}
                </p>
              )}
              {profile.mobility && (
                <p className="flex items-center gap-2">
                  <MoveRight size={15} className="text-blue-700 shrink-0" />
                  {profile.mobility}
                </p>
              )}
              {profile.phone && (
                <a href={`tel:${profile.phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone size={15} className="text-blue-700 shrink-0" />
                  {profile.phone}
                </a>
              )}
              {profile.email && (
                <a href={`mailto:${profile.email}`}
                  className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail size={15} className="text-blue-700 shrink-0" />
                  {profile.email}
                </a>
              )}
            </div>

            {/* Réseaux sociaux */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-1">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#05091a] border border-white/5 text-slate-400 text-sm font-medium hover:border-blue-700/40 hover:text-white transition-all"
                  >
                    <SocialIcon platform={link.platform} />
                    {link.platform}
                  </a>
                ))}
              </div>
            )}
          </AnimatedSection>
        </div>

        {/* Bio pleine largeur */}
        {profile.tagline && (
          <AnimatedSection delay={0.3}>
            <div className="border-t border-white/5 pt-10">
              <p className="text-slate-400 text-base leading-relaxed border-l-2 border-blue-700/50 pl-5">
                {profile.tagline}
              </p>
            </div>
          </AnimatedSection>
        )}
      </div>
    </section>
  );
}