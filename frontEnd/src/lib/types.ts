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
  ctaTitle: string;
  ctaText: string;
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

export interface Language {
  id: string;
  title: string;
  level: string;
  order: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}