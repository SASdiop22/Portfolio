import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse, UserProfile } from '@/lib/types';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<UserProfile>>('/users/profile');
      return data.data;
    },
  });
}