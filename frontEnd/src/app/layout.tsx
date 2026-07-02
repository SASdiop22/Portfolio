import type { Metadata } from 'next';
import '../styles/globals.css';
import { QueryProvider } from '@/components/ui/QueryProvider';
import { ConditionalLayout } from '@/components/layout/ConditionalLayout';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Mon portfolio professionnel',
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body>
        <QueryProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </QueryProvider>
      </body>
    </html>
  );
}
