import { FilterOptions, SORT_OPTIONS, STYLE_OPTIONS } from '@/app/types/portfolio'
import { useState } from 'react'
import { format } from 'date-fns'

interface Props {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  collections: Array<{ id: string; name: string; _count: { items: number } }>
  allTags: string[]
}

export default function PortfolioFilters({
  filters,
  onFiltersChange,
  collections,
  allTags
}: Props) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: value || null
      }
    })
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            placeholder="Search titles and descriptions..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Style Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
          <select
            value={filters.style}
            onChange={(e) => onFiltersChange({ ...filters, style: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Styles</option>
            {STYLE_OPTIONS.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Controls */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <div className="flex space-x-2">
            <select
              value={filters.sortBy}
              onChange={(e) => onFiltersChange({
                ...filters,
                sortBy: e.target.value,
                sortOrder: filters.sortBy === e.target.value ? filters.sortOrder : 'desc'
              })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => onFiltersChange({
                ...filters,
                sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc'
              })}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {filters.sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>

        {/* Collection Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Collection</label>
          <select
            value={filters.collection}
            onChange={(e) => onFiltersChange({ ...filters, collection: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Collections</option>
            <option value="uncategorized">Uncategorized</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name} ({collection._count.items})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="mt-4 border-t pt-4">
        <button
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center"
        >
          <span>{isAdvancedOpen ? 'Hide' : 'Show'} Advanced Filters</span>
          <svg
            className={`ml-2 h-5 w-5 transform transition-transform ${
              isAdvancedOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Advanced Filters Panel */}
        {isAdvancedOpen && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Date Range</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={filters.dateRange.start || ''}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-gray-500 self-center">to</span>
                <input
                  type="date"
                  value={filters.dateRange.end || ''}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Featured Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Featured Status</label>
              <select
                value={filters.featured === null ? '' : filters.featured.toString()}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  featured: e.target.value === '' ? null : e.target.value === 'true'
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">All Items</option>
                <option value="true">Featured Only</option>
                <option value="false">Non-Featured Only</option>
              </select>
            </div>

            {/* Tags Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Tags</label>
              <select
                value=""
                onChange={(e) => {
                  const tag = e.target.value
                  if (tag && !filters.tags.includes(tag)) {
                    onFiltersChange({
                      ...filters,
                      tags: [...filters.tags, tag]
                    })
                  }
                }}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Add a tag...</option>
                {allTags
                  .filter(tag => !filters.tags.includes(tag))
                  .map(tag => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))
                }
              </select>
              {filters.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {filters.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => onFiltersChange({
                          ...filters,
                          tags: filters.tags.filter(t => t !== tag)
                        })}
                        className="ml-1 text-indigo-600 hover:text-indigo-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 