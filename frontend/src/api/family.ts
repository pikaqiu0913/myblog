import apiClient from './client'
import type { FamilyMember, FamilyMemberDetail, ApiResponse } from '@/types'

export const familyApi = {
  getMembers: () => apiClient.get<ApiResponse<FamilyMember[]>>('/family/members'),
  getMemberDetail: (id: number) => apiClient.get<ApiResponse<FamilyMemberDetail>>(`/family/members/${id}`),
  createMember: (data: Partial<FamilyMember>) => apiClient.post<ApiResponse<FamilyMember>>('/family/members', data),
  updateMember: (id: number, data: Partial<FamilyMember>) => apiClient.put<ApiResponse<FamilyMember>>(`/family/members/${id}`, data),
  deleteMember: (id: number) => apiClient.delete(`/family/members/${id}`),
  addPhoto: (memberId: number, mediaId: number, caption?: string) =>
    apiClient.post(`/family/members/${memberId}/photos`, null, { params: { media_id: mediaId, caption } }),
  deletePhoto: (memberId: number, photoId: number) =>
    apiClient.delete(`/family/members/${memberId}/photos/${photoId}`),
}
