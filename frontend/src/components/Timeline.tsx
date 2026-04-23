import type { Education } from '@/types'

interface Props {
  items: Education[]
}

export default function Timeline({ items }: Props) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary-200 transform md:-translate-x-px" />

      {items.map((item, index) => (
        <div
          key={item.id}
          className={`relative flex items-start mb-8 ${
            index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
          }`}
        >
          {/* Content */}
          <div className="ml-12 md:ml-0 md:w-1/2 md:px-8">
            <div className="bg-white rounded-lg shadow-sm border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{item.school_name}</h3>
                {item.is_current && (
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                    在读
                  </span>
                )}
              </div>
              <p className="text-sm text-primary-600 mb-1">
                {item.major} {item.degree && `· ${item.degree}`}
              </p>
              <p className="text-xs text-gray-500 mb-3">
                {item.start_date} ~ {item.end_date || '至今'}
              </p>
              {item.description && (
                <p className="text-sm text-gray-600">{item.description}</p>
              )}
            </div>
          </div>

          {/* Dot */}
          <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-primary-500 rounded-full border-2 border-white shadow transform -translate-x-1/2 mt-6" />
        </div>
      ))}
    </div>
  )
}
