import apiClient from './client'
import type { GuestbookMessage, ApiResponse } from '@/types'

export const guestbookApi = {
  getMessages: () =>
    apiClient.get<ApiResponse<GuestbookMessage[]>>('/guestbook/messages'),

  getAllMessages: () =>
    apiClient.get<ApiResponse<GuestbookMessage[]>>('/guestbook/messages/all'),

  createMessage: (data: { nickname: string; content: string; contact?: string }) =>
    apiClient.post<ApiResponse<GuestbookMessage>>('/guestbook/messages', data),

  updateMessage: (id: number, data: { is_public?: boolean }) =>
    apiClient.put<ApiResponse<GuestbookMessage>>(`/guestbook/messages/${id}`, data),

  deleteMessage: (id: number) =>
    apiClient.delete(`/guestbook/messages/${id}`),
}
