import { useEffect, useState } from 'react'
import { profileApi } from '@/api/profile'
import type { PhotoAlbum } from '@/types'
import LazyImage from '@/components/LazyImage'

export default function PhotoAlbums() {
  const [albums, setAlbums] = useState<PhotoAlbum[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    profileApi.getPhotoAlbums().then((res) => {
      if (res.data.data) setAlbums(res.data.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-pulse grid grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">生活相册</h1>
        <p className="text-gray-500">记录生活中的美好瞬间</p>
      </div>

      {albums.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {albums.map((album) => (
            <div
              key={album.id}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="aspect-square relative">
                {album.cover ? (
                  <LazyImage
                    src={album.cover.file_url}
                    alt={album.name}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                    暂无封面
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-lg">{album.name}</h3>
                  {album.description && (
                    <p className="text-white/80 text-sm mt-1 line-clamp-2">
                      {album.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">暂无相册</div>
      )}
    </div>
  )
}
