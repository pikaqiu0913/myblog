import apiClient from './client'
import type { Profile, Education, PhotoAlbum, ApiResponse } from '@/types'

export const profileApi = {
  getProfile: () => apiClient.get<ApiResponse<Profile>>('/profile/'),
  updateProfile: (data: Partial<Profile>) => apiClient.put<ApiResponse<Profile>>('/profile/', data),

  getEducationList: () => apiClient.get<ApiResponse<Education[]>>('/profile/education'),
  createEducation: (data: Partial<Education>) => apiClient.post<ApiResponse<Education>>('/profile/education', data),
  updateEducation: (id: number, data: Partial<Education>) => apiClient.put<ApiResponse<Education>>(`/profile/education/${id}`, data),
  deleteEducation: (id: number) => apiClient.delete(`/profile/education/${id}`),

  getPhotoAlbums: () => apiClient.get<ApiResponse<PhotoAlbum[]>>('/profile/photo_albums'),
  createPhotoAlbum: (data: Partial<PhotoAlbum>) => apiClient.post<ApiResponse<PhotoAlbum>>('/profile/photo_albums', data),
  updatePhotoAlbum: (id: number, data: Partial<PhotoAlbum>) => apiClient.put<ApiResponse<PhotoAlbum>>(`/profile/photo_albums/${id}`, data),
  deletePhotoAlbum: (id: number) => apiClient.delete(`/profile/photo_albums/${id}`),
}
