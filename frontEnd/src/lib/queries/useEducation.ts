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