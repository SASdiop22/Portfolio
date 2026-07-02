import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse, Experience } from '@/lib/types';

export function useExperiences() {
  return useQuery({
    queryKey: ['experiences'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Experience[]>>('/experience');
      return data.data;
    },
  });
}