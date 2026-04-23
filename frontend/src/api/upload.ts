import apiClient from './client'
import type { Media, ApiResponse } from '@/types'

export const uploadApi = {
  uploadImage: (file: File, moduleType: string = 'general') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('module_type', moduleType)
    return apiClient.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  uploadImages: (files: File[], moduleType: string = 'general') => {
    const formData = new FormData()
    files.forEach(f => formData.append('files', f))
    formData.append('module_type', moduleType)
    return apiClient.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  listMedia: (moduleType?: string) => {
    const params = moduleType ? { module_type: moduleType } : undefined
    return apiClient.get<ApiResponse<Media[]>>('/upload/list', { params })
  },
  deleteMedia: (id: number) => apiClient.delete(`/upload/${id}`),
}
