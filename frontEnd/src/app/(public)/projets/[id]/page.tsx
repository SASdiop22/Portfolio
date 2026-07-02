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