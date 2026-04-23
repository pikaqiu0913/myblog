import apiClient from './client'
import type { FriendMember, FriendMemberDetail, ApiResponse } from '@/types'

export const friendApi = {
  getMembers: () => apiClient.get<ApiResponse<{
    categories: { key: string; label: string; members: FriendMember[] }[]
  }>>('/friends/members'),

  getMemberDetail: (id: number) => apiClient.get<ApiResponse<FriendMemberDetail>>(`/friends/members/${id}`),

  createMember: (data: Partial<FriendMemberDetail>) => apiClient.post<ApiResponse<FriendMember>>('/friends/members', data),

  updateMember: (id: number, data: Partial<FriendMemberDetail>) => apiClient.put<ApiResponse<FriendMember>>(`/friends/members/${id}`, data),

  deleteMember: (id: number) => apiClient.delete(`/friends/members/${id}`),
}
