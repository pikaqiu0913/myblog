import apiClient from './client'
import type { Article, ArticleListItem, Category, PaginatedResponse, ApiResponse } from '@/types'

export const blogApi = {
  getArticles: (params?: { page?: number; page_size?: number; category?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<ArticleListItem>>>('/blog/articles', { params }),
  getArticleDetail: (slug: string) => apiClient.get<ApiResponse<Article>>(`/blog/articles/${slug}`),
  createArticle: (data: Partial<Article>) => apiClient.post<ApiResponse<Article>>('/blog/articles', data),
  updateArticle: (id: number, data: Partial<Article>) => apiClient.put<ApiResponse<Article>>(`/blog/articles/${id}`, data),
  deleteArticle: (id: number) => apiClient.delete(`/blog/articles/${id}`),

  getCategories: () => apiClient.get<ApiResponse<Category[]>>('/blog/categories'),
  createCategory: (data: Partial<Category>) => apiClient.post<ApiResponse<Category>>('/blog/categories', data),
  updateCategory: (id: number, data: Partial<Category>) => apiClient.put<ApiResponse<Category>>(`/blog/categories/${id}`, data),
  deleteCategory: (id: number) => apiClient.delete(`/blog/categories/${id}`),
}
