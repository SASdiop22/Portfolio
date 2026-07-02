import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse, Language } from '@/lib/types';

export function useLanguages() {
  return useQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Language[]>>('/languages');
      return data.data;
    },
  });
}