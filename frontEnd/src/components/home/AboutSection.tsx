'use client';

import Image from 'next/image';
import { MapPin, MoveRight, Phone } from 'lucide-react';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { useProfile } from '@/lib/queries/useProfile';

export function AboutSection() {
  const { data: profile } = useProfile();

  if (!profile) return null;

  const initials = `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`;

  return (
    <section className="py-24 bg-[#0a1128]">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <AnimatedSection delay={0} className="flex justify-center">
          <div className="relative w-72 h-72">
            {profile.photo ? (
              <Image
                src={profile.photo}
                alt={`${profile.firstName} ${profile.lastName}`}
                fill
                className="object-cover rounded-2xl ring-2 ring-blue-700/50"
              />
            ) : (
              <div className="w-full h-full rounded-2xl bg-[#05091a] ring-2 ring-blue-700/50 flex items-center justify-center text-6xl font-black text-blue-700">
                {initials}
              </div>
            )}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          <h2 className="text-4xl font-bold text-white mb-1">
            {profile.firstName} {profile.lastName}
          </h2>
          <p className="text-blue-400 text-xl mb-6">{profile.desiredPosition}</p>

          <div className="space-y-3 text-slate-400 text-sm">
            {profile.city && (
              <p className="flex items-center gap-2">
                <MapPin size={16} className="text-blue-700 shrink-0" />
                {profile.city}
              </p>
            )}
            {profile.mobility && (
              <p className="flex items-center gap-2">
                <MoveRight size={16} className="text-blue-700 shrink-0" />
                {profile.mobility}
              </p>
            )}
            {profile.phone && (
              <p className="flex items-center gap-2">
                <Phone size={16} className="text-blue-700 shrink-0" />
                {profile.phone}
              </p>
            )}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}