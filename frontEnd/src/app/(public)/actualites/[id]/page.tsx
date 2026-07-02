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