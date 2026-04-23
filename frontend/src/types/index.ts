export interface Media {
  id: number
  original_name: string
  file_name: string
  file_url: string
  mime_type: string
  file_size: number
  width?: number
  height?: number
  alt_text?: string
  description?: string
  created_at: string
}

export interface Profile {
  id: number
  real_name: string
  nick_name?: string
  motto?: string
  bio?: string
  bio_html?: string
  birth_date?: string
  location?: string
  email_public?: string
  phone_public?: string
  github_url?: string
  linkedin_url?: string
  wechat_qr_url?: string
  avatar?: Media
  resume_url?: string
  is_public: boolean
  view_count: number
}

export interface Education {
  id: number
  school_name: string
  major?: string
  degree?: string
  start_date: string
  end_date?: string
  is_current: boolean
  description?: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PhotoAlbum {
  id: number
  name: string
  slug: string
  description?: string
  cover?: Media
  sort_order: number
  is_public: boolean
  created_at: string
}

export interface FamilyMember {
  id: number
  name: string
  relation: string
  avatar?: Media
  bio_summary?: string
  bio?: string
  photo_count: number
  sort_order: number
}

export interface FamilyMemberDetail extends FamilyMember {
  bio?: string
  bio_html?: string
  birth_date?: string
  hobbies?: string[]
  photos: FamilyMemberPhoto[]
  view_count: number
  created_at: string
}

export interface FamilyMemberPhoto {
  id: number
  media_id: number
  file_url: string
  caption?: string
  sort_order: number
  created_at: string
}

export interface FriendMember {
  id: number
  name: string
  category: string
  avatar?: Media
  bio?: string
  bio_summary?: string
  sort_order: number
}

export interface FriendMemberDetail extends FriendMember {
  bio?: string
  bio_html?: string
  created_at: string
}

export interface GuestbookMessage {
  id: number
  nickname: string
  content: string
  contact?: string
  is_public: boolean
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  sort_order: number
  created_at: string
}

export interface Article {
  id: number
  title: string
  slug: string
  summary?: string
  content?: string
  html_content?: string
  cover?: Media
  category_id?: number
  category?: Category
  author_id?: number
  status: string
  view_count: number
  is_top: boolean
  meta_keywords?: string
  meta_description?: string
  published_at?: string
  created_at: string
  updated_at: string
}

export interface ArticleListItem {
  id: number
  title: string
  slug: string
  summary?: string
  cover?: Media
  category?: Category
  view_count: number
  is_top: boolean
  published_at?: string
  created_at: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  request_id?: string
}
