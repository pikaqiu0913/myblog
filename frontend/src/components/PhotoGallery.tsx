import { useState } from 'react'
import LazyImage from './LazyImage'

interface Photo {
  id: number
  file_url: string
  caption?: string
  width?: number
  height?: number
}

interface Props {
  photos: Photo[]
}

export default function PhotoGallery({ photos }: Props) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        暂无照片
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="aspect-square cursor-pointer group relative overflow-hidden rounded-lg"
            onClick={() => setSelectedPhoto(photo)}
          >
            <LazyImage
              src={photo.file_url}
              alt={photo.caption || ''}
              className="w-full h-full"
            />
            {photo.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-sm truncate">{photo.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
            onClick={() => setSelectedPhoto(null)}
          >
            ✕
          </button>
          <img
            src={selectedPhoto.file_url}
            alt={selectedPhoto.caption || ''}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          {selectedPhoto.caption && (
            <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
              {selectedPhoto.caption}
            </p>
          )}
        </div>
      )}
    </>
  )
}
