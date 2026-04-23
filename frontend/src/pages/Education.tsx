import { useEffect, useState } from 'react'
import { profileApi } from '@/api/profile'
import type { Education } from '@/types'
import Timeline from '@/components/Timeline'

export default function EducationPage() {
  const [items, setItems] = useState<Education[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    profileApi.getEducationList().then((res) => {
      if (res.data.data) setItems(res.data.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">教育经历</h1>
        <p className="text-gray-500">不断学习，持续成长</p>
      </div>

      {items.length > 0 ? (
        <Timeline items={items} />
      ) : (
        <div className="text-center py-12 text-gray-500">暂无教育经历</div>
      )}
    </div>
  )
}
