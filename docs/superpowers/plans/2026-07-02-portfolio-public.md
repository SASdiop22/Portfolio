# Portfolio Public Frontend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete public portfolio frontend (Home, Parcours, Projets, Compétences, Actualités) — dark futuristic design, all content dynamic from the backend API.

**Architecture:** Next.js 14 App Router with Server Component pages wrapping Client Component data islands. Three.js particle scenes are lazy-loaded (SSR disabled) via `next/dynamic`. React Query v5 handles all API data with 60s stale time.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS v3, Framer Motion, React Three Fiber v9, @react-three/drei, Three.js, @tanstack/react-query v5, Axios, lucide-react, shadcn/ui (CSS vars)

## Global Constraints

- Work directory: `/Users/abdousamad/Portfolio/frontEnd`
- Run all commands from `/Users/abdousamad/Portfolio/frontEnd` (never `~/Desktop`)
- TypeScript strict mode; `npx tsc --noEmit` must pass at end of each task
- Dark-only palette: bg `#05091a`, alt bg `#0a1128`, accent `#1d4ed8` (blue-700), hover `#2563eb`, text `#e2e8f0`, muted `#64748b`
- All data from API at `http://localhost:5000/api/v1`; API wrapper: `{ success: boolean, data: T }`
- All page routes use `src/app/(public)/` route group (except Home at `src/app/page.tsx`)
- `page.tsx` files = Server Components (no `'use client'`); data fetching lives in Client Components
- Three.js/R3F components always `'use client'` + loaded via `dynamic(..., { ssr: false })`
- No comments unless the WHY is non-obvious; no placeholders; no extra features

---

## File Map

```
src/
├── lib/
│   ├── types.ts                                  # All domain types (Task 1)
│   ├── api.ts                                    # Axios client (EXISTING)
│   ├── utils.ts                                  # cn() (EXISTING)
│   └── queries/
│       ├── useProfile.ts                         # (Task 2)
│       ├── useEducation.ts                       # (Task 2)
│       ├── useExperiences.ts                     # (Task 2)
│       ├── useProjects.ts                        # (Task 2) — includes useProject(id)
│       ├── useSkills.ts                          # (Task 2)
│       ├── useNews.ts                            # (Task 2) — includes useNewsItem(id)
│       └── useSocialLinks.ts                     # (Task 2)
├── components/
│   ├── ui/
│   │   ├── QueryProvider.tsx                     # React Query provider (EXISTING)
│   │   ├── AnimatedSection.tsx                   # Framer Motion scroll reveal (Task 3)
│   │   └── SectionHero.tsx                       # Mini hero with particles (Task 5)
│   ├── layout/
│   │   ├── Navbar.tsx                            # Fixed nav + mobile drawer (Task 4)
│   │   └── Footer.tsx                            # Social links footer (Task 4)
│   ├── three/
│   │   ├── ParticleField.tsx                     # Full-screen R3F scene (Task 5)
│   │   └── MiniParticleField.tsx                 # Reduced R3F scene (Task 5)
│   ├── home/
│   │   ├── HeroSection.tsx                       # Hero with ParticleField (Task 6)
│   │   ├── AboutSection.tsx                      # Photo + bio (Task 6)
│   │   ├── SkillsPreview.tsx                     # 8-card grid preview (Task 7)
│   │   └── ProjectsPreview.tsx                   # 3 featured projects (Task 7)
│   ├── parcours/
│   │   ├── Timeline.tsx                          # Container, merges edu+exp (Task 8)
│   │   └── TimelineEntry.tsx                     # Individual entry card (Task 8)
│   ├── projets/
│   │   ├── ProjectCard.tsx                       # Grid card (Task 9)
│   │   ├── TechBadge.tsx                         # Small tech badge (Task 9)
│   │   ├── ProjetsList.tsx                       # Client data island (Task 9)
│   │   └── ProjectDetail.tsx                     # Client detail page (Task 10)
│   ├── competences/
│   │   ├── SkillCard.tsx                         # Card + animated bar (Task 11)
│   │   ├── SkillCategory.tsx                     # Category section (Task 11)
│   │   └── CompetencesList.tsx                   # Client data island (Task 11)
│   └── actualites/
│       ├── NewsCard.tsx                          # Grid card (Task 11)
│       ├── NewsList.tsx                          # Client data island (Task 11)
│       └── NewsDetail.tsx                        # Client detail island (Task 11)
├── app/
│   ├── layout.tsx                                # Add dark class + Navbar/Footer (Task 4)
│   ├── page.tsx                                  # Home — import all sections (Task 7)
│   └── (public)/
│       ├── parcours/page.tsx                     # (Task 8)
│       ├── projets/
│       │   ├── page.tsx                          # (Task 9)
│       │   └── [id]/page.tsx                     # (Task 10)
│       ├── competences/page.tsx                  # (Task 11)
│       └── actualites/
│           ├── page.tsx                          # (Task 11)
│           └── [id]/page.tsx                     # (Task 11)
└── styles/
    └── globals.css                               # Update dark vars (Task 1)
```

---

### Task 1: Foundation — R3F install + design tokens + shared types

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `tailwind.config.js`
- Modify: `src/styles/globals.css`
- Create: `src/lib/types.ts`
- Modify: `next.config.js`

**Interfaces:**
- Produces: `UserProfile`, `Education`, `Experience`, `Project`, `Skill`, `News`, `SocialLink`, `ApiResponse<T>` — imported by all subsequent tasks

- [ ] **Step 1: Install Three.js and React Three Fiber**

```bash
cd /Users/abdousamad/Portfolio/frontEnd
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

Expected: packages installed without errors.

- [ ] **Step 2: Update next.config.js to transpile Three.js**

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three'],
};

module.exports = nextConfig;
```

- [ ] **Step 3: Update tailwind.config.js — add navy palette**

Replace the existing `theme.extend.colors` block:

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
```

- [ ] **Step 4: Rewrite globals.css for dark-only mode**

Replace the full content of `src/styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 229 68% 6%;
    --foreground: 214 32% 91%;
    --card: 227 60% 11%;
    --card-foreground: 214 32% 91%;
    --border: 217 33% 18%;
    --input: 217 33% 18%;
    --primary: 225 74% 48%;
    --primary-foreground: 0 0% 100%;
    --secondary: 227 60% 11%;
    --secondary-foreground: 214 32% 91%;
    --muted: 227 60% 11%;
    --muted-foreground: 215 14% 47%;
    --accent: 225 74% 48%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 63% 31%;
    --destructive-foreground: 210 40% 98%;
    --ring: 225 74% 48%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

Note: No `.dark {}` block needed — dark values are in `:root` because the site is dark-only. `layout.tsx` will add `className="dark"` to `<html>` so shadcn components still receive the dark context.

- [ ] **Step 5: Create src/lib/types.ts**

```typescript
// src/lib/types.ts
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  desiredPosition: string;
  tagline: string;
  photo: string | null;
  city: string;
  mobility: string;
  phone: string;
  email: string;
}

export interface Education {
  id: string;
  institution: string;
  city: string;
  title: string;
  specialization: string;
  description: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  order: number;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  city: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  link: string | null;
  order: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  imageUrl: string | null;
  demoUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
  order: number;
}

export interface Skill {
  id: string;
  title: string;
  category: string;
  level: number;
  icon: string | null;
  order: number;
}

export interface News {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  imageUrl: string | null;
  publishedAt: string;
  order: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  logo: string | null;
  order: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
```

- [ ] **Step 6: Verify TypeScript**

```bash
cd /Users/abdousamad/Portfolio/frontEnd && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
cd /Users/abdousamad/Portfolio/frontEnd
git add next.config.js tailwind.config.js src/styles/globals.css src/lib/types.ts package.json package-lock.json
git commit -m "feat(frontend): R3F install, dark design tokens, shared domain types"
```

---

### Task 2: React Query hooks — all 7 data hooks

**Files:**
- Create: `src/lib/queries/useProfile.ts`
- Create: `src/lib/queries/useEducation.ts`
- Create: `src/lib/queries/useExperiences.ts`
- Create: `src/lib/queries/useProjects.ts`
- Create: `src/lib/queries/useSkills.ts`
- Create: `src/lib/queries/useNews.ts`
- Create: `src/lib/queries/useSocialLinks.ts`

**Interfaces:**
- Consumes: `ApiResponse<T>`, all domain types from `@/lib/types`; `api` from `@/lib/api`
- Produces:
  - `useProfile()` → `UseQueryResult<UserProfile>`
  - `useEducation()` → `UseQueryResult<Education[]>`
  - `useExperiences()` → `UseQueryResult<Experience[]>`
  - `useProjects()` → `UseQueryResult<Project[]>`
  - `useProject(id: string)` → `UseQueryResult<Project>`
  - `useSkills()` → `UseQueryResult<Skill[]>`
  - `useNews()` → `UseQueryResult<News[]>`
  - `useNewsItem(id: string)` → `UseQueryResult<News>`
  - `useSocialLinks()` → `UseQueryResult<SocialLink[]>`

- [ ] **Step 1: Create src/lib/queries/useProfile.ts**

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse, UserProfile } from '@/lib/types';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<UserProfile>>('/users/profile');
      return data.data;
    },
  });
}
```

- [ ] **Step 2: Create src/lib/queries/useEducation.ts**

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse, Education } from '@/lib/types';

export function useEducation() {
  return useQuery({
    queryKey: ['education'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Education[]>>('/education');
      return data.data;
    },
  });
}
```

- [ ] **Step 3: Create src/lib/queries/useExperiences.ts**

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse, Experience } from '@/lib/types';

export function useExperiences() {
  return useQuery({
    queryKey: ['experiences'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Experience[]>>('/experiences');
      return data.data;
    },
  });
}
```

- [ ] **Step 4: Create src/lib/queries/useProjects.ts**

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse, Project } from '@/lib/types';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Project[]>>('/projects');
      return data.data;
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Project>>(`/projects/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}
```

- [ ] **Step 5: Create src/lib/queries/useSkills.ts**

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse, Skill } from '@/lib/types';

export function useSkills() {
  return useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Skill[]>>('/skills');
      return data.data;
    },
  });
}
```

- [ ] **Step 6: Create src/lib/queries/useNews.ts**

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse, News } from '@/lib/types';

export function useNews() {
  return useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<News[]>>('/news');
      return data.data;
    },
  });
}

export function useNewsItem(id: string) {
  return useQuery({
    queryKey: ['news', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<News>>(`/news/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}
```

- [ ] **Step 7: Create src/lib/queries/useSocialLinks.ts**

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse, SocialLink } from '@/lib/types';

export function useSocialLinks() {
  return useQuery({
    queryKey: ['social-links'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<SocialLink[]>>('/social-links');
      return data.data;
    },
  });
}
```

- [ ] **Step 8: Verify TypeScript**

```bash
cd /Users/abdousamad/Portfolio/frontEnd && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 9: Commit**

```bash
git add src/lib/queries/
git commit -m "feat(frontend): React Query hooks for all 7 API resources"
```

---

### Task 3: AnimatedSection — scroll-reveal wrapper component

**Files:**
- Create: `src/components/ui/AnimatedSection.tsx`

**Interfaces:**
- Produces: `AnimatedSection({ children, className?, delay? })`  — consumed by Tasks 6–11

- [ ] **Step 1: Create src/components/ui/AnimatedSection.tsx**

```tsx
'use client';

import { motion, type Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedSection({ children, className, delay = 0 }: Props) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/abdousamad/Portfolio/frontEnd && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/AnimatedSection.tsx
git commit -m "feat(frontend): AnimatedSection scroll-reveal wrapper"
```

---

### Task 4: Shared layout — Navbar + Footer + update layout.tsx

**Files:**
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/Footer.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `useProfile()` (Task 2), `useSocialLinks()` (Task 2), `AnimatedSection` is not needed here
- Produces: `<Navbar />`, `<Footer />` wrapped around all pages via `layout.tsx`

- [ ] **Step 1: Create src/components/layout/Navbar.tsx**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useProfile } from '@/lib/queries/useProfile';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Accueil' },
  { href: '/parcours', label: 'Parcours' },
  { href: '/projets', label: 'Projets' },
  { href: '/competences', label: 'Compétences' },
  { href: '/actualites', label: 'Actualités' },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: profile } = useProfile();
  const [open, setOpen] = useState(false);

  const initials = profile
    ? `${profile.firstName[0]}${profile.lastName[0]}`
    : 'AS';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/70 border-b border-white/5">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-blue-700 tracking-tight">
          {initials}
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <li key={link.href} className="relative">
              <Link
                href={link.href}
                className={cn(
                  'text-sm transition-colors',
                  pathname === link.href
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {link.label}
              </Link>
              {pathname === link.href && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute -bottom-px left-0 right-0 h-0.5 bg-blue-700"
                />
              )}
            </li>
          ))}
        </ul>

        <button
          className="md:hidden text-slate-400 hover:text-white transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed inset-y-0 right-0 w-64 bg-[#0a1128] border-l border-white/5 z-50 flex flex-col pt-20 px-6 gap-6"
          >
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
            >
              <X size={24} />
            </button>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'text-lg transition-colors',
                  pathname === link.href
                    ? 'text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
```

- [ ] **Step 2: Create src/components/layout/Footer.tsx**

```tsx
'use client';

import Link from 'next/link';
import { useSocialLinks } from '@/lib/queries/useSocialLinks';
import { useProfile } from '@/lib/queries/useProfile';

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/parcours', label: 'Parcours' },
  { href: '/projets', label: 'Projets' },
  { href: '/competences', label: 'Compétences' },
  { href: '/actualites', label: 'Actualités' },
];

export function Footer() {
  const { data: profile } = useProfile();
  const { data: socialLinks } = useSocialLinks();

  return (
    <footer className="bg-[#0a0f1e] border-t border-white/5 py-12">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
        <div>
          <p className="text-lg font-bold text-white mb-2">
            {profile ? `${profile.firstName} ${profile.lastName}` : 'Portfolio'}
          </p>
          {profile?.tagline && (
            <p className="text-slate-500 text-sm">{profile.tagline}</p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Navigation
          </p>
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Réseaux
          </p>
          <div className="flex flex-wrap gap-3">
            {socialLinks?.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                {link.logo ? (
                  <img src={link.logo} alt={link.platform} className="w-5 h-5" />
                ) : (
                  link.platform
                )}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10 pt-6 border-t border-white/5">
        <p className="text-xs text-slate-600 text-center">
          © {new Date().getFullYear()} {profile?.firstName} {profile?.lastName}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Update src/app/layout.tsx**

```tsx
import type { Metadata } from 'next';
import '../styles/globals.css';
import { QueryProvider } from '@/components/ui/QueryProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Mon portfolio professionnel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body>
        <QueryProvider>
          <Navbar />
          {children}
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd /Users/abdousamad/Portfolio/frontEnd && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/ src/app/layout.tsx
git commit -m "feat(frontend): Navbar, Footer, dark layout with QueryProvider"
```

---

### Task 5: Three.js particles + SectionHero

**Files:**
- Create: `src/components/three/ParticleField.tsx`
- Create: `src/components/three/MiniParticleField.tsx`
- Create: `src/components/ui/SectionHero.tsx`

**Interfaces:**
- Produces:
  - `ParticleField` — full-screen R3F canvas; consumed by HeroSection (Task 6) via `dynamic()`
  - `MiniParticleField` — reduced R3F canvas; consumed by SectionHero
  - `SectionHero({ title: string })` — page title hero with particles; consumed by Tasks 8–11

- [ ] **Step 1: Create src/components/three/ParticleField.tsx**

```tsx
'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles() {
  const mesh = useRef<THREE.Points>(null!);
  const COUNT = 4000;

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 12;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    mesh.current.rotation.y = clock.getElapsedTime() * 0.04;
    mesh.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.015) * 0.08;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#1d4ed8"
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export function ParticleField() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{ alpha: true, antialias: false }}
      className="!absolute inset-0"
      style={{ background: 'transparent' }}
    >
      <Particles />
    </Canvas>
  );
}
```

- [ ] **Step 2: Create src/components/three/MiniParticleField.tsx**

```tsx
'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles() {
  const mesh = useRef<THREE.Points>(null!);
  const COUNT = 1200;

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    mesh.current.rotation.y = clock.getElapsedTime() * 0.03;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.012}
        color="#1d4ed8"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export function MiniParticleField() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{ alpha: true, antialias: false }}
      className="!absolute inset-0"
      style={{ background: 'transparent' }}
    >
      <Particles />
    </Canvas>
  );
}
```

- [ ] **Step 3: Create src/components/ui/SectionHero.tsx**

```tsx
'use client';

import dynamic from 'next/dynamic';

const MiniParticleField = dynamic(
  () =>
    import('@/components/three/MiniParticleField').then(
      (m) => m.MiniParticleField
    ),
  { ssr: false }
);

interface Props {
  title: string;
}

export function SectionHero({ title }: Props) {
  return (
    <section className="relative flex items-center justify-center h-52 overflow-hidden bg-[#05091a]">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <MiniParticleField />
      </div>
      <div className="relative z-10 text-center px-6">
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
          {title}
        </h1>
        <div className="mt-3 h-1 w-16 bg-blue-700 mx-auto rounded-full" />
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd /Users/abdousamad/Portfolio/frontEnd && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/three/ src/components/ui/SectionHero.tsx
git commit -m "feat(frontend): Three.js ParticleField, MiniParticleField, SectionHero"
```

---

### Task 6: Home — HeroSection + AboutSection

**Files:**
- Create: `src/components/home/HeroSection.tsx`
- Create: `src/components/home/AboutSection.tsx`

**Interfaces:**
- Consumes: `useProfile()` (Task 2), `AnimatedSection` (Task 3), `ParticleField` via `dynamic()` (Task 5)
- Produces: `<HeroSection />`, `<AboutSection />` — consumed by `page.tsx` (Task 7)

- [ ] **Step 1: Create src/components/home/HeroSection.tsx**

```tsx
'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useProfile } from '@/lib/queries/useProfile';

const ParticleField = dynamic(
  () =>
    import('@/components/three/ParticleField').then((m) => m.ParticleField),
  { ssr: false }
);

export function HeroSection() {
  const { data: profile } = useProfile();

  const name = profile
    ? `${profile.firstName} ${profile.lastName}`
    : '';

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#05091a]">
      <div className="absolute inset-0 pointer-events-none">
        <ParticleField />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {name && (
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-7xl md:text-8xl font-black text-white mb-4 leading-none"
          >
            {name}
          </motion.h1>
        )}

        {profile?.desiredPosition && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-2xl md:text-3xl text-blue-400 font-mono mb-4"
          >
            {profile.desiredPosition}
          </motion.p>
        )}

        {profile?.tagline && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto"
          >
            {profile.tagline}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/projets"
            className="px-8 py-3 bg-blue-700 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
          >
            Voir mes projets
          </Link>
          {profile?.email && (
            <a
              href={`mailto:${profile.email}`}
              className="px-8 py-3 border border-blue-700/50 hover:border-blue-700 text-slate-300 hover:text-white font-semibold rounded-lg transition-colors"
            >
              Me contacter
            </a>
          )}
        </motion.div>
      </div>

      <motion.div
        animate={{ opacity: [1, 0.3, 1], y: [0, 6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-600"
      >
        <ChevronDown size={32} />
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Create src/components/home/AboutSection.tsx**

```tsx
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
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd /Users/abdousamad/Portfolio/frontEnd && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/HeroSection.tsx src/components/home/AboutSection.tsx
git commit -m "feat(frontend): Home HeroSection with 3D particles and AboutSection"
```

---

### Task 7: Home complete — SkillsPreview + ProjectsPreview + CTA + page.tsx

**Files:**
- Create: `src/components/home/SkillsPreview.tsx`
- Create: `src/components/home/ProjectsPreview.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `useSkills()` (Task 2), `useProjects()` (Task 2), `AnimatedSection` (Task 3), `HeroSection` + `AboutSection` (Task 6)
- Produces: complete Home page at `/`

- [ ] **Step 1: Create src/components/home/SkillsPreview.tsx**

```tsx
'use client';

import Link from 'next/link';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { useSkills } from '@/lib/queries/useSkills';

export function SkillsPreview() {
  const { data: skills } = useSkills();
  const preview = skills?.slice(0, 8) ?? [];

  return (
    <section className="py-24 bg-[#05091a]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-white">Mes Compétences</h2>
          <Link
            href="/competences"
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            Voir tout →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {preview.map((skill, i) => (
            <AnimatedSection key={skill.id} delay={i * 0.05}>
              <div className="bg-[#0a1128] border border-white/5 rounded-xl p-4 hover:border-blue-700/30 transition-colors h-full">
                {skill.icon && (
                  <span className="text-2xl mb-2 block">{skill.icon}</span>
                )}
                <p className="text-white font-medium text-sm mb-3">
                  {skill.title}
                </p>
                <div className="w-full bg-[#05091a] rounded-full h-1.5">
                  <div
                    className="bg-blue-700 h-1.5 rounded-full transition-all"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create src/components/home/ProjectsPreview.tsx**

```tsx
'use client';

import Link from 'next/link';
import { Github, ExternalLink } from 'lucide-react';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { useProjects } from '@/lib/queries/useProjects';

export function ProjectsPreview() {
  const { data: projects } = useProjects();

  const featured = projects
    ? (projects.filter((p) => p.featured).length > 0
        ? projects.filter((p) => p.featured)
        : projects
      ).slice(0, 3)
    : [];

  return (
    <section className="py-24 bg-[#0a1128]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-white">Mes Projets</h2>
          <Link
            href="/projets"
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            Voir tout →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {featured.map((project, i) => (
            <AnimatedSection key={project.id} delay={i * 0.1}>
              <Link href={`/projets/${project.id}`} className="block group">
                <div className="bg-[#05091a] border border-white/5 rounded-xl overflow-hidden hover:border-blue-700/30 transition-colors">
                  <div className="h-48 bg-gradient-to-br from-blue-900/20 to-[#05091a] relative overflow-hidden">
                    {project.imageUrl && (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-white font-semibold mb-2">
                      {project.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 text-xs bg-blue-700/15 text-blue-400 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div
                      className="flex gap-3"
                      onClick={(e) => e.preventDefault()}
                    >
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:text-white transition-colors"
                        >
                          <Github size={16} />
                        </a>
                      )}
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:text-white transition-colors"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Update src/app/page.tsx**

```tsx
import { HeroSection } from '@/components/home/HeroSection';
import { AboutSection } from '@/components/home/AboutSection';
import { SkillsPreview } from '@/components/home/SkillsPreview';
import { ProjectsPreview } from '@/components/home/ProjectsPreview';

function CTASection() {
  return (
    <section className="py-24 bg-[#05091a] text-center">
      <div className="max-w-2xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-white mb-4">
          Travaillons ensemble
        </h2>
        <p className="text-slate-400 mb-8">
          Je suis disponible pour des opportunités freelance ou en CDI.
        </p>
        <a
          href="mailto:serigneasdiop@gmail.com"
          className="inline-block px-10 py-4 bg-blue-700 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors text-lg"
        >
          Me contacter
        </a>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <SkillsPreview />
      <ProjectsPreview />
      <CTASection />
    </main>
  );
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd /Users/abdousamad/Portfolio/frontEnd && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 5: Smoke test — start the dev server**

```bash
cd /Users/abdousamad/Portfolio/frontEnd && npm run dev
```

Open `http://localhost:3000` in the browser. Verify:
- Dark navy background loads
- Navbar appears with "AS" initials
- Particle field visible in hero (may take 1-2s for WebGL init)
- No console errors

Stop the server with Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add src/components/home/SkillsPreview.tsx src/components/home/ProjectsPreview.tsx src/app/page.tsx
git commit -m "feat(frontend): complete Home page — Hero, About, Skills, Projects, CTA"
```

---

### Task 8: Parcours page — timeline of education + experience

**Files:**
- Create: `src/components/parcours/Timeline.tsx`
- Create: `src/components/parcours/TimelineEntry.tsx`
- Create: `src/app/(public)/parcours/page.tsx`

**Interfaces:**
- Consumes: `useEducation()`, `useExperiences()` (Task 2), `AnimatedSection` (Task 3), `SectionHero` (Task 5)
- Consumes types: `Education`, `Experience` from `@/lib/types`
- Produces: `/parcours` page

- [ ] **Step 1: Create src/components/parcours/TimelineEntry.tsx**

```tsx
'use client';

import { GraduationCap, Briefcase, ExternalLink } from 'lucide-react';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import type { Education, Experience } from '@/lib/types';

type TimelineItem =
  | { type: 'education'; data: Education }
  | { type: 'experience'; data: Experience };

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

interface Props {
  item: TimelineItem;
  index: number;
}

export function TimelineEntry({ item, index }: Props) {
  const Icon = item.type === 'education' ? GraduationCap : Briefcase;

  const title =
    item.type === 'education'
      ? `${item.data.title}${item.data.specialization ? ` — ${item.data.specialization}` : ''}`
      : `${item.data.position}${item.data.title ? ` / ${item.data.title}` : ''}`;

  const subtitle =
    item.type === 'education'
      ? `${item.data.institution}, ${item.data.city}`
      : `${item.data.company}, ${item.data.city}`;

  const endLabel = item.data.current
    ? "Aujourd'hui"
    : item.data.endDate
    ? formatDate(item.data.endDate)
    : '';

  const period = `${formatDate(item.data.startDate)}${endLabel ? ` — ${endLabel}` : ''}`;

  const link =
    item.type === 'experience' ? item.data.link : null;

  return (
    <AnimatedSection delay={index * 0.07} className="relative pl-12 pb-12">
      <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-[#05091a] border-2 border-blue-700 flex items-center justify-center">
        <Icon size={14} className="text-blue-400" />
      </div>

      <div className="bg-[#0a1128] border border-white/5 rounded-xl p-6 hover:border-blue-700/20 transition-colors">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-white font-semibold text-lg leading-snug">{title}</h3>
          {item.data.current && (
            <span className="px-2 py-0.5 text-xs bg-green-900/30 text-green-400 border border-green-500/30 rounded-full shrink-0">
              Actuel
            </span>
          )}
        </div>
        <p className="text-blue-400 text-sm mb-1">{subtitle}</p>
        <p className="text-slate-500 text-xs mb-3">{period}</p>
        {item.data.description && (
          <p className="text-slate-400 text-sm">{item.data.description}</p>
        )}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-3 transition-colors"
          >
            Voir plus <ExternalLink size={12} />
          </a>
        )}
      </div>
    </AnimatedSection>
  );
}
```

- [ ] **Step 2: Create src/components/parcours/Timeline.tsx**

```tsx
'use client';

import { useEducation } from '@/lib/queries/useEducation';
import { useExperiences } from '@/lib/queries/useExperiences';
import { TimelineEntry } from './TimelineEntry';
import type { Education, Experience } from '@/lib/types';

type TimelineItem =
  | { type: 'education'; data: Education }
  | { type: 'experience'; data: Experience };

export function Timeline() {
  const { data: education } = useEducation();
  const { data: experiences } = useExperiences();

  const items: TimelineItem[] = [
    ...(education?.map((d) => ({ type: 'education' as const, data: d })) ?? []),
    ...(experiences?.map((d) => ({ type: 'experience' as const, data: d })) ?? []),
  ].sort(
    (a, b) =>
      new Date(b.data.startDate).getTime() -
      new Date(a.data.startDate).getTime()
  );

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        Aucune entrée pour le moment.
      </div>
    );
  }

  return (
    <section className="py-24 bg-[#05091a]">
      <div className="max-w-3xl mx-auto px-6">
        <div className="relative border-l-2 border-blue-700/30 ml-4">
          {items.map((item, i) => (
            <TimelineEntry
              key={`${item.type}-${item.data.id}`}
              item={item}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create src/app/(public)/parcours/page.tsx**

```tsx
import { SectionHero } from '@/components/ui/SectionHero';
import { Timeline } from '@/components/parcours/Timeline';

export default function ParcoursPage() {
  return (
    <main className="pt-16">
      <SectionHero title="Mon Parcours" />
      <Timeline />
    </main>
  );
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd /Users/abdousamad/Portfolio/frontEnd && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/parcours/ src/app/\(public\)/parcours/
git commit -m "feat(frontend): Parcours page with education/experience timeline"
```

---

### Task 9: Projets list page — ProjectCard + TechBadge + grid

**Files:**
- Create: `src/components/projets/TechBadge.tsx`
- Create: `src/components/projets/ProjectCard.tsx`
- Create: `src/components/projets/ProjetsList.tsx`
- Create: `src/app/(public)/projets/page.tsx`

**Interfaces:**
- Consumes: `useProjects()` (Task 2), `AnimatedSection` (Task 3), `SectionHero` (Task 5)
- Produces:
  - `TechBadge({ label: string })` — also consumed by Task 10 (detail page)
  - `ProjectCard({ project: Project })` — self-contained card
  - `/projets` page

- [ ] **Step 1: Create src/components/projets/TechBadge.tsx**

```tsx
interface Props {
  label: string;
}

export function TechBadge({ label }: Props) {
  return (
    <span className="px-2 py-0.5 text-xs bg-blue-700/15 text-blue-400 border border-blue-700/20 rounded">
      {label}
    </span>
  );
}
```

- [ ] **Step 2: Create src/components/projets/ProjectCard.tsx**

```tsx
'use client';

import Link from 'next/link';
import { Github, ExternalLink } from 'lucide-react';
import { TechBadge } from './TechBadge';
import { cn } from '@/lib/utils';
import type { Project } from '@/lib/types';

interface Props {
  project: Project;
}

export function ProjectCard({ project }: Props) {
  return (
    <Link href={`/projets/${project.id}`} className="block group">
      <div
        className={cn(
          'bg-[#0a1128] border border-white/5 rounded-xl overflow-hidden transition-all duration-300',
          'hover:border-blue-700/30 hover:scale-[1.02]',
          project.featured && 'ring-2 ring-blue-700/40'
        )}
      >
        <div className="relative h-48 bg-gradient-to-br from-blue-900/20 to-[#05091a] overflow-hidden">
          {project.imageUrl && (
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
          )}
        </div>

        <div className="p-5">
          <h3 className="text-white font-semibold text-lg mb-2">
            {project.title}
          </h3>
          <p className="text-slate-400 text-sm mb-4 line-clamp-3">
            {project.description.length > 120
              ? `${project.description.slice(0, 120)}...`
              : project.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.technologies.slice(0, 4).map((tech) => (
              <TechBadge key={tech} label={tech} />
            ))}
            {project.technologies.length > 4 && (
              <span className="px-2 py-0.5 text-xs text-slate-500">
                +{project.technologies.length - 4}
              </span>
            )}
          </div>

          <div
            className="flex gap-3"
            onClick={(e) => e.preventDefault()}
          >
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-white transition-colors"
              >
                <Github size={18} />
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-white transition-colors"
              >
                <ExternalLink size={18} />
              </a>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Create src/components/projets/ProjetsList.tsx**

```tsx
'use client';

import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { ProjectCard } from './ProjectCard';
import { useProjects } from '@/lib/queries/useProjects';

export function ProjetsList() {
  const { data: projects, isLoading } = useProjects();

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
        Chargement...
      </div>
    );
  }

  if (!projects?.length) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
        Aucun projet pour le moment.
      </div>
    );
  }

  return (
    <section className="py-24 bg-[#05091a]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <AnimatedSection key={project.id} delay={i * 0.05}>
              <ProjectCard project={project} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create src/app/(public)/projets/page.tsx**

```tsx
import { SectionHero } from '@/components/ui/SectionHero';
import { ProjetsList } from '@/components/projets/ProjetsList';

export default function ProjetsPage() {
  return (
    <main className="pt-16">
      <SectionHero title="Mes Projets" />
      <ProjetsList />
    </main>
  );
}
```

- [ ] **Step 5: Verify TypeScript**

```bash
cd /Users/abdousamad/Portfolio/frontEnd && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/projets/TechBadge.tsx src/components/projets/ProjectCard.tsx src/components/projets/ProjetsList.tsx src/app/\(public\)/projets/page.tsx
git commit -m "feat(frontend): Projets list page with ProjectCard grid"
```

---

### Task 10: Projets detail page — /projets/[id]

**Files:**
- Create: `src/components/projets/ProjectDetail.tsx`
- Create: `src/app/(public)/projets/[id]/page.tsx`

**Interfaces:**
- Consumes: `useProject(id: string)` (Task 2), `TechBadge` (Task 9)
- Produces: `/projets/[id]` page

- [ ] **Step 1: Create src/components/projets/ProjectDetail.tsx**

```tsx
'use client';

import { Github, ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { TechBadge } from './TechBadge';
import { useProject } from '@/lib/queries/useProjects';

interface Props {
  id: string;
}

export function ProjectDetail({ id }: Props) {
  const { data: project, isLoading } = useProject(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05091a] flex items-center justify-center text-slate-500">
        Chargement...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#05091a] flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Projet introuvable.</p>
        <Link href="/projets" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
          ← Retour aux projets
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#05091a] min-h-screen">
      <div className="relative h-72 md:h-96 bg-gradient-to-br from-blue-900/20 to-[#05091a] overflow-hidden">
        {project.imageUrl && (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05091a] via-[#05091a]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-4xl mx-auto px-6 pb-8">
          <h1 className="text-5xl md:text-6xl font-black text-white">
            {project.title}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link
          href="/projets"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft size={14} /> Retour aux projets
        </Link>

        <div className="flex flex-wrap gap-2 mb-10">
          {project.technologies.map((tech) => (
            <TechBadge key={tech} label={tech} />
          ))}
        </div>

        <div className="prose prose-invert prose-slate max-w-none mb-12 text-slate-300">
          <p className="text-lg leading-relaxed">
            {project.longDescription || project.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
            >
              <ExternalLink size={18} /> Voir la démo
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-blue-700/50 hover:border-blue-700 text-slate-300 hover:text-white rounded-lg transition-colors font-medium"
            >
              <Github size={18} /> GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create src/app/(public)/projets/[id]/page.tsx**

```tsx
import { ProjectDetail } from '@/components/projets/ProjectDetail';

interface Props {
  params: { id: string };
}

export default function ProjectPage({ params }: Props) {
  return (
    <main className="pt-16">
      <ProjectDetail id={params.id} />
    </main>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd /Users/abdousamad/Portfolio/frontEnd && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/projets/ProjectDetail.tsx src/app/\(public\)/projets/\[id\]/
git commit -m "feat(frontend): Projets detail page /projets/[id]"
```

---

### Task 11: Compétences page + Actualités list + detail pages

**Files:**
- Create: `src/components/competences/SkillCard.tsx`
- Create: `src/components/competences/SkillCategory.tsx`
- Create: `src/components/competences/CompetencesList.tsx`
- Create: `src/app/(public)/competences/page.tsx`
- Create: `src/components/actualites/NewsCard.tsx`
- Create: `src/components/actualites/NewsList.tsx`
- Create: `src/components/actualites/NewsDetail.tsx`
- Create: `src/app/(public)/actualites/page.tsx`
- Create: `src/app/(public)/actualites/[id]/page.tsx`

**Interfaces:**
- Consumes: `useSkills()`, `useNews()`, `useNewsItem(id)` (Task 2), `AnimatedSection` (Task 3), `SectionHero` (Task 5)
- Produces: `/competences`, `/actualites`, `/actualites/[id]` pages

- [ ] **Step 1: Create src/components/competences/SkillCard.tsx**

```tsx
'use client';

import { motion } from 'framer-motion';
import type { Skill } from '@/lib/types';

interface Props {
  skill: Skill;
}

export function SkillCard({ skill }: Props) {
  return (
    <div className="bg-[#0a1128] border border-white/5 rounded-xl p-5 hover:border-blue-700/30 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        {skill.icon && (
          <span className="text-2xl leading-none">{skill.icon}</span>
        )}
        <span className="text-white font-medium text-sm flex-1">
          {skill.title}
        </span>
        <span className="text-xs text-slate-500">{skill.level}%</span>
      </div>
      <div className="w-full bg-[#05091a] rounded-full h-2 overflow-hidden">
        <motion.div
          className="bg-blue-700 h-2 rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.15, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/competences/SkillCategory.tsx**

```tsx
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { SkillCard } from './SkillCard';
import type { Skill } from '@/lib/types';

interface Props {
  category: string;
  skills: Skill[];
}

export function SkillCategory({ category, skills }: Props) {
  return (
    <div className="mb-14">
      <h2 className="text-2xl font-bold text-white mb-6 capitalize">
        {category}
      </h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {skills.map((skill, i) => (
          <AnimatedSection key={skill.id} delay={i * 0.04}>
            <SkillCard skill={skill} />
          </AnimatedSection>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create src/components/competences/CompetencesList.tsx**

```tsx
'use client';

import { useSkills } from '@/lib/queries/useSkills';
import { SkillCategory } from './SkillCategory';

export function CompetencesList() {
  const { data: skills, isLoading } = useSkills();

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
        Chargement...
      </div>
    );
  }

  if (!skills?.length) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
        Aucune compétence pour le moment.
      </div>
    );
  }

  const categories = Array.from(new Set(skills.map((s) => s.category)));

  return (
    <section className="py-24 bg-[#05091a]">
      <div className="max-w-6xl mx-auto px-6">
        {categories.map((cat) => (
          <SkillCategory
            key={cat}
            category={cat}
            skills={skills.filter((s) => s.category === cat)}
          />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create src/app/(public)/competences/page.tsx**

```tsx
import { SectionHero } from '@/components/ui/SectionHero';
import { CompetencesList } from '@/components/competences/CompetencesList';

export default function CompetencesPage() {
  return (
    <main className="pt-16">
      <SectionHero title="Mes Compétences" />
      <CompetencesList />
    </main>
  );
}
```

- [ ] **Step 5: Create src/components/actualites/NewsCard.tsx**

```tsx
import Link from 'next/link';
import type { News } from '@/lib/types';

interface Props {
  news: News;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function NewsCard({ news }: Props) {
  return (
    <Link href={`/actualites/${news.id}`} className="block group">
      <div className="bg-[#0a1128] border border-white/5 rounded-xl overflow-hidden hover:border-blue-700/30 transition-colors">
        <div className="relative h-48 bg-gradient-to-br from-blue-900/15 to-[#05091a] overflow-hidden">
          {news.imageUrl && (
            <img
              src={news.imageUrl}
              alt={news.title}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
          )}
          <span className="absolute top-3 left-3 px-2 py-0.5 text-xs bg-blue-700/80 text-white rounded capitalize">
            {news.category}
          </span>
        </div>
        <div className="p-5">
          <p className="text-slate-500 text-xs mb-2">{formatDate(news.publishedAt)}</p>
          <h3 className="text-white font-semibold mb-2 group-hover:text-blue-300 transition-colors leading-snug">
            {news.title}
          </h3>
          <p className="text-slate-400 text-sm line-clamp-3">
            {news.summary.length > 150
              ? `${news.summary.slice(0, 150)}...`
              : news.summary}
          </p>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 6: Create src/components/actualites/NewsList.tsx**

```tsx
'use client';

import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { NewsCard } from './NewsCard';
import { useNews } from '@/lib/queries/useNews';

export function NewsList() {
  const { data: newsList, isLoading } = useNews();

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
        Chargement...
      </div>
    );
  }

  if (!newsList?.length) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
        Aucune actualité pour le moment.
      </div>
    );
  }

  const sorted = [...newsList].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <section className="py-24 bg-[#05091a]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((news, i) => (
            <AnimatedSection key={news.id} delay={i * 0.05}>
              <NewsCard news={news} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Create src/components/actualites/NewsDetail.tsx**

```tsx
'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useNewsItem } from '@/lib/queries/useNews';

interface Props {
  id: string;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function NewsDetail({ id }: Props) {
  const { data: news, isLoading } = useNewsItem(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05091a] flex items-center justify-center text-slate-500">
        Chargement...
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-[#05091a] flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Article introuvable.</p>
        <Link href="/actualites" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
          ← Retour aux actualités
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#05091a] min-h-screen">
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-blue-900/20 to-[#05091a] overflow-hidden">
        {news.imageUrl && (
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05091a] via-[#05091a]/30 to-transparent" />
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/actualites"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Retour aux actualités
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 text-xs bg-blue-700/80 text-white rounded capitalize">
            {news.category}
          </span>
          <span className="text-slate-500 text-sm">{formatDate(news.publishedAt)}</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-white mb-10 leading-tight">
          {news.title}
        </h1>

        <div
          className="prose prose-invert prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Create src/app/(public)/actualites/page.tsx**

```tsx
import { SectionHero } from '@/components/ui/SectionHero';
import { NewsList } from '@/components/actualites/NewsList';

export default function ActualitesPage() {
  return (
    <main className="pt-16">
      <SectionHero title="Actualités" />
      <NewsList />
    </main>
  );
}
```

- [ ] **Step 9: Create src/app/(public)/actualites/[id]/page.tsx**

```tsx
import { NewsDetail } from '@/components/actualites/NewsDetail';

interface Props {
  params: { id: string };
}

export default function NewsPage({ params }: Props) {
  return (
    <main className="pt-16">
      <NewsDetail id={params.id} />
    </main>
  );
}
```

- [ ] **Step 10: Verify TypeScript**

```bash
cd /Users/abdousamad/Portfolio/frontEnd && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 11: Final smoke test**

Start the backend (`cd ~/Portfolio/backEnd && npm start`) and the frontend (`cd ~/Portfolio/frontEnd && npm run dev`).

Navigate and verify each route:
- `/` — Hero with particles, About, Skills preview, Projects preview, CTA
- `/parcours` — SectionHero + vertical timeline
- `/projets` — grid of project cards
- `/projets/<valid-id>` — full detail with tech badges
- `/competences` — grouped skill bars (animated on scroll)
- `/actualites` — news card grid
- `/actualites/<valid-id>` — article detail with prose

- [ ] **Step 12: Commit**

```bash
git add src/components/competences/ src/components/actualites/ src/app/\(public\)/competences/ src/app/\(public\)/actualites/
git commit -m "feat(frontend): Compétences, Actualités list and detail pages — public portfolio complete"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered by task |
|---|---|
| Dark navy bg `#05091a` / `#0a1128` | Task 1 (globals.css) |
| Accent `#1d4ed8` blue-700 | Task 1 (tailwind + globals.css) |
| Navbar fixed, backdrop-blur, mobile drawer | Task 4 |
| Footer with social links | Task 4 |
| ParticleField 4000 particles R3F | Task 5 |
| HeroSection with name, position, tagline, CTAs | Task 6 |
| AboutSection photo + bio fields | Task 6 |
| SkillsPreview 8 cards | Task 7 |
| ProjectsPreview 3 featured | Task 7 |
| CTA section | Task 7 |
| Parcours timeline edu + exp merged, sorted | Task 8 |
| "Actuel" badge for current entries | Task 8 |
| Projets grid with `featured` ring | Task 9 |
| Projets detail with prose + links | Task 10 |
| Compétences grouped by category + animated bar | Task 11 |
| Actualités sorted by publishedAt desc | Task 11 |
| Actualités detail with prose content | Task 11 |
| All data from API (dynamic) | Tasks 2–11 |
| AnimatedSection scroll reveal on all sections | Tasks 3, 6–11 |
| SectionHero with MiniParticleField | Task 5 |
| Responsive (grid cols, mobile nav) | Tailwind responsive prefixes throughout |

**Placeholder scan:** None found.

**Type consistency:**
- `TimelineItem` type is redeclared identically in both `Timeline.tsx` and `TimelineEntry.tsx` — correct (avoids a shared type just for internal use).
- `useProject(id)` and `useNewsItem(id)` exported from `useProjects.ts` and `useNews.ts` respectively — confirmed.
- `TechBadge` imported by both `ProjectCard` (Task 9) and `ProjectDetail` (Task 10) — correct path `@/components/projets/TechBadge`.

---

**Plan complete and saved to `docs/superpowers/plans/2026-07-02-portfolio-public.md`.**

**Two execution options:**

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — execute tasks in this session using executing-plans, with checkpoints

**Which approach?**