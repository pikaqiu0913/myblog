import { useState, useEffect } from 'react'
import { uploadApi } from '@/api/upload'
import type { Media } from '@/types'

export default function AdminMediaManager() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [moduleType, setModuleType] = useState('general')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [mediaList, setMediaList] = useState<Media[]>([])
  const [loading, setLoading] = useState(false)

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const res = await uploadApi.listMedia()
      if (res.data.data) {
        setMediaList(res.data.data)
      }
    } catch {
      console.error('加载媒体列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [])

  const handleUpload = async () => {
    if (!files || files.length === 0) return

    setUploading(true)
    const uploadFiles = Array.from(files)

    try {
      if (uploadFiles.length === 1) {
        const res = await uploadApi.uploadImage(uploadFiles[0], moduleType)
        if (res.data.data) {
          setResults((prev) => [...prev, res.data.data])
        }
      } else {
        const res = await uploadApi.uploadImages(uploadFiles, moduleType)
        if (res.data.data) {
          setResults((prev) => [...prev, ...res.data.data])
        }
      }
      await fetchMedia()
    } catch {
      alert('上传失败')
    } finally {
      setUploading(false)
      setFiles(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除该媒体文件？')) return
    try {
      await uploadApi.deleteMedia(id)
      await fetchMedia()
      setResults((prev) => prev.filter((r) => (r.id || r.media?.id) !== id))
    } catch {
      alert('删除失败')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">媒体管理</h1>

        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">用途分类</label>
            <select
              value={moduleType}
              onChange={(e) => setModuleType(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="general">通用</option>
              <option value="profile">个人介绍</option>
              <option value="family">家庭成员</option>
              <option value="article">文章封面</option>
              <option value="photo_album">相册</option>
            </select>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(e.target.files)}
              className="hidden"
              id="media-upload"
            />
            <label htmlFor="media-upload" className="cursor-pointer block">
              <div className="text-4xl mb-2">📤</div>
              <p className="text-gray-600 font-medium">
                {files ? `已选择 ${files.length} 个文件` : '点击选择图片'}
              </p>
              <p className="text-sm text-gray-400 mt-1">支持 JPG、PNG、WebP，单个文件最大 10MB</p>
            </label>
          </div>

          {files && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-4 w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
            >
              {uploading ? '上传中...' : '开始上传'}
            </button>
          )}
        </div>

        {/* 全部媒体列表 */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">媒体库</h2>
            <span className="text-sm text-gray-500">共 {mediaList.length} 个文件</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">加载中...</div>
          ) : mediaList.length > 0 || results.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* 本次上传的结果 */}
              {results.map((result, index) => (
                <div key={`upload-${index}`} className="rounded-lg overflow-hidden border border-primary-200 bg-primary-50">
                  <div className="relative">
                    <img
                      src={result.signed_url || result.media?.file_url}
                      alt={result.media?.original_name || ''}
                      className="w-full aspect-square object-cover cursor-pointer hover:opacity-90 transition"
                      onClick={() => setPreviewImage(result.signed_url || result.media?.file_url)}
                    />
                    <span className="absolute top-1 left-1 text-[10px] bg-primary-600 text-white px-1.5 py-0.5 rounded">刚上传</span>
                  </div>
                  <div className="p-2 flex items-center justify-between">
                    <p className="text-xs text-gray-500 truncate">ID: {result.id || result.media?.id}</p>
                    <button
                      onClick={() => handleDelete(result.id || result.media?.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
              {/* 已有媒体 */}
              {mediaList.map((media) => (
                <div key={media.id} className="rounded-lg overflow-hidden border">
                  <img
                    src={media.file_url}
                    alt={media.original_name}
                    className="w-full aspect-square object-cover cursor-pointer hover:opacity-90 transition"
                    onClick={() => setPreviewImage(media.file_url)}
                  />
                  <div className="p-2 flex items-center justify-between">
                    <p className="text-xs text-gray-500 truncate">ID: {media.id}</p>
                    <button
                      onClick={() => handleDelete(media.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              暂无媒体文件，上传后会显示在这里
            </div>
          )}
        </div>

        {/* 图片预览 Lightbox */}
        {previewImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <button
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
              onClick={() => setPreviewImage(null)}
            >
              ✕
            </button>
            <img
              src={previewImage}
              alt="preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  )
}
