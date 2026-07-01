# Portfolio Public — Design Spec

**Statut :** Approuvé  
**Date :** 2026-07-02  
**Scope :** Site public uniquement (pas le back-office admin)

---

## Objectif

Construire le portfolio public complet : Home (hero 3D interactif), Parcours, Projets, Compétences, Actualités. Design dark & futuriste, niveau premium (Dribbble). Toutes les données sont dynamiques via l'API backend.

---

## Esthétique globale

- **Mode** : Dark uniquement
- **Fond principal** : Dark navy profond (`#05091a`) — bleu nuit, pas noir pur
- **Fond sections alternées** : Navy plus soutenu (`#0a1128`)
- **Accent principal** : Bleu foncé saphir (`#1d4ed8` / `blue-700`)
- **Accent hover/glow** : Bleu légèrement plus clair (`#2563eb` / `blue-600`) pour les états actifs
- **Texte principal** : Blanc doux (`#e2e8f0` / `slate-200`)
- **Texte secondaire** : Bleu-gris muted (`#64748b` / `slate-500`)
- **Typographie** : `Inter` variable (déjà dispo via Next.js) — display 72–96px pour les titres hero, 48px pour les titres de page, 16–18px pour le corps
- **Border radius** : `0.5rem` (cohérent avec la config shadcn)
- **Animations** : Framer Motion pour les transitions scroll ; React Three Fiber pour la scène 3D

---

## Stack technique

| Besoin | Package |
|---|---|
| Scène 3D WebGL | `@react-three/fiber` + `@react-three/drei` |
| Animations scroll/UI | `framer-motion` (installé) |
| Data fetching | `@tanstack/react-query` (installé) |
| HTTP client | `axios` via `src/lib/api.ts` (installé) |
| Styling | Tailwind CSS v3 (installé) |
| Icônes | `lucide-react` (installé) |
| Classes conditionnelles | `clsx` + `tailwind-merge` via `cn()` (installé) |
| Prose (contenu Actualités) | `@tailwindcss/typography` (installé) |

**À installer :** `@react-three/fiber @react-three/drei three @types/three`

---

## Architecture fichiers

```
src/
├── app/
│   ├── layout.tsx                        # RootLayout (QueryProvider, globals.css)
│   ├── page.tsx                          # Home /
│   ├── (public)/
│   │   ├── parcours/page.tsx             # /parcours
│   │   ├── projets/
│   │   │   ├── page.tsx                  # /projets
│   │   │   └── [id]/page.tsx             # /projets/[id]
│   │   ├── competences/page.tsx          # /competences
│   │   └── actualites/
│   │       ├── page.tsx                  # /actualites
│   │       └── [id]/page.tsx             # /actualites/[id]
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                    # Navigation fixe partagée
│   │   └── Footer.tsx                    # Footer partagé
│   ├── three/
│   │   ├── ParticleField.tsx             # Scène Three.js (hero plein écran)
│   │   └── MiniParticleField.tsx         # Version réduite pour mini-héros
│   ├── home/
│   │   ├── HeroSection.tsx               # Hero particules + texte
│   │   ├── AboutSection.tsx              # Photo + bio
│   │   ├── SkillsPreview.tsx             # Grid 4 cols compétences
│   │   └── ProjectsPreview.tsx           # 3 projets featured
│   ├── parcours/
│   │   ├── Timeline.tsx                  # Timeline verticale conteneur
│   │   └── TimelineEntry.tsx             # Entrée individuelle formation/expérience
│   ├── projets/
│   │   ├── ProjectCard.tsx               # Card grille projets
│   │   └── TechBadge.tsx                 # Badge technologie
│   ├── competences/
│   │   ├── SkillCard.tsx                 # Card compétence avec barre niveau
│   │   └── SkillCategory.tsx             # Section par catégorie
│   ├── actualites/
│   │   └── NewsCard.tsx                  # Card actualité
│   └── ui/
│       ├── QueryProvider.tsx             # React Query provider (existant)
│       ├── SectionHero.tsx               # Mini-hero réutilisable (titre + particules)
│       └── AnimatedSection.tsx           # Wrapper Framer Motion scroll reveal
├── lib/
│   ├── api.ts                            # Client Axios (existant)
│   ├── utils.ts                          # cn() (existant)
│   └── queries/                          # React Query hooks par ressource
│       ├── useProfile.ts
│       ├── useEducation.ts
│       ├── useExperiences.ts
│       ├── useProjects.ts
│       ├── useSkills.ts
│       ├── useNews.ts
│       └── useSocialLinks.ts
└── styles/
    └── globals.css                       # Tailwind + CSS variables (existant)
```

---

## Composants partagés

### Navbar
- Position : `fixed top-0`, `z-50`, `backdrop-blur-md bg-black/70`, border-bottom `border-white/5`
- Logo : initiales en `font-bold text-blue-700` (depuis profil si dispo, sinon "AS")
- Liens : `Accueil · Parcours · Projets · Compétences · Actualités`
- Indicateur actif : underline néon bleu animé (Framer Motion `layoutId`)
- Mobile : hamburger → drawer slide-in droite avec Framer Motion

### Footer
- 3 colonnes : Nom + tagline | Liens navigation | Icônes réseaux sociaux
- Réseaux : `GET /api/v1/social-links` → `platform`, `url`, `logo`
- Fond `#0a0f1e`, border-top `border-white/5`

### AnimatedSection
- Wrapper réutilisable : `opacity 0→1` + `y 40→0` au scroll (Framer Motion `whileInView`)
- Delay configurable pour les stagger effects

### SectionHero (mini-hero)
- Titre de page en display bold + MiniParticleField en fond (densité réduite)
- Réutilisé sur Parcours, Projets, Compétences, Actualités

---

## Page Home `/`

### HeroSection
- `ParticleField` : scène R3F plein écran (`position: fixed`), 4 000 particules `Points`, shader custom couleur `#1d4ed8` avec variation aléatoire, animation `useFrame` rotation lente + attracteur souris (`raycaster`)
- Contenu centré (`z-10` au-dessus des particules) :
  - `firstName + lastName` en `text-7xl font-black text-white`
  - `desiredPosition` avec effet typewriter Framer Motion (`animate` sur `width`)
  - `tagline` en `text-muted-foreground text-xl`
  - CTA primaire : "Voir mes projets" → `/projets`
  - CTA ghost : "Me contacter" → `mailto:` depuis `email` du profil
- Scroll indicator : chevron animé en bas, disparaît au scroll

### AboutSection
- 2 colonnes : photo à gauche avec `ring-2 ring-blue-700/50` + border néon animé, texte à droite
- Photo depuis `profile.photo` (fallback avatar initiales)
- Champs affichés : `firstName lastName`, `desiredPosition`, `city`, `mobility`, `phone`
- Apparition : slide-in left/right au scroll

### SkillsPreview
- Titre "Mes Compétences" + lien "Voir tout →"
- Grid 4 cols — 8 premières compétences (triées par `order`)
- Chaque card : `icon`, `title`, barre niveau (`level/100`)
- Hover : tilt CSS 3D (`perspective: 1000px`, `rotateX/Y` sur `mousemove`)

### ProjectsPreview
- Titre "Mes Projets" + lien "Voir tout →"
- 3 projets `featured: true` (ou les 3 premiers si aucun featured)
- Card : `imageUrl` (gradient placeholder si vide), `title`, `description` tronquée, badges `technologies`

---

## Page Parcours `/parcours`

- SectionHero "Mon Parcours"
- Timeline verticale : ligne centrale `border-l-2 border-blue-700/30`
- Entrées triées par `startDate` décroissant (plus récent en haut)
- **Formation** (icône `GraduationCap`) : `title` + `specialization` | `institution`, `city` | période | `description`
- **Expérience** (icône `Briefcase`) : `position` / `title` | `company`, `city` | période | `description` | lien `link`
- "Actuel" si `current: true` (badge vert)
- Chaque entrée : AnimatedSection avec stagger

---

## Page Projets `/projets`

- SectionHero "Mes Projets"
- Grid 3 cols (desktop) / 2 (tablet) / 1 (mobile)
- `ProjectCard` : `imageUrl` ou gradient généré, `title`, `description` (max 120 chars), badges `technologies[]`, icônes `Github` + `ExternalLink`
- Projects `featured: true` → `ring-2 ring-blue-700`
- Hover : `scale-105` + overlay néon

### Page détail `/projets/[id]`
- Image hero plein-largeur (ou gradient)
- `title` en display, `longDescription` en prose
- Tous les badges `technologies[]`
- Boutons Demo (`demoUrl`) + GitHub (`githubUrl`) si présents

---

## Page Compétences `/competences`

- SectionHero "Mes Compétences"
- Groupées par `category` : une section par catégorie avec titre
- `SkillCard` : `icon`, `title`, barre `level` animée (Framer Motion, 0→level à l'entrée viewport)
- `level` interprété comme 0–100 (pourcentage)
- Hover : tilt 3D CSS

---

## Page Actualités `/actualites`

- SectionHero "Actualités"
- Grid 3 cols de `NewsCard` : `imageUrl` ou placeholder gradient par `category`, badge `category`, `publishedAt` (format "2 juillet 2026"), `title`, `summary` (max 150 chars)
- Tri par `publishedAt` décroissant

### Page détail `/actualites/[id]`
- Image hero
- `title`, date, badge catégorie
- `content` rendu en prose (`@tailwindcss/typography`, classe `prose prose-invert`)

---

## Endpoints API utilisés

| Composant | Endpoint |
|---|---|
| Navbar logo, About, Hero | `GET /api/v1/users/profile` |
| Timeline Formation | `GET /api/v1/education` |
| Timeline Expérience | `GET /api/v1/experiences` |
| Projets (liste + détail) | `GET /api/v1/projects` + `GET /api/v1/projects/:id` |
| Compétences | `GET /api/v1/skills` |
| Actualités (liste + détail) | `GET /api/v1/news` + `GET /api/v1/news/:id` |
| Footer réseaux | `GET /api/v1/social-links` |

---

## Responsive

- **Desktop** (≥1024px) : layouts multi-colonnes, timeline alternée gauche/droite
- **Tablet** (768–1023px) : grids 2 cols, timeline single-side
- **Mobile** (<768px) : single col, navbar hamburger, hero texte réduit (48px)

---

## Non inclus dans ce spec

- Back-office admin (spec séparé)
- Authentification côté frontend
- Page de contact avec formulaire (peut être ajoutée en extension)
- Internationalisation (FR uniquement)