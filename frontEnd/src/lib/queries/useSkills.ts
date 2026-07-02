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