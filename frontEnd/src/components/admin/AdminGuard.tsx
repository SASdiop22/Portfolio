'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/admin/auth';

export function AdminGuard({ children }: { readonly children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated()) router.replace('/admin');
  }, [router]);
  if (typeof window !== 'undefined' && !isAuthenticated()) return null;
  return <>{children}</>;
}