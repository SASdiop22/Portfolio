import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse, SocialLink } from '@/lib/types';

export function useSocialLinks() {
  return useQuery({
    queryKey: ['social-links'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<SocialLink[]>>('/social-links');
      return data.data;
    },
  });
}