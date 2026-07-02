import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse, News } from '@/lib/types';

export function useNews() {
  return useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<News[]>>('/news');
      return data.data;
    },
  });
}

export function useNewsItem(id: string) {
  return useQuery({
    queryKey: ['news', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<News>>(`/news/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}