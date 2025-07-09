export interface PortfolioItem {
  id: string
  title: string
  description: string | null
  imageUrl: string
  tags: string[]
  style: string
  featured: boolean
  order: number
  collectionId: string | null
  createdAt: string
  collection?: {
    id: string
    name: string
  }
}

export interface Collection {
  id: string
  name: string
  description: string | null
  coverImage: string | null
  _count: {
    items: number
  }
}

export interface FilterOptions {
  style: string
  tags: string[]
  sortBy: string
  sortOrder: 'asc' | 'desc'
  collection: string
  dateRange: {
    start: string | null
    end: string | null
  }
  featured: boolean | null
  search: string
}

export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date' },
  { value: 'title', label: 'Title' },
  { value: 'style', label: 'Style' },
  { value: 'featured', label: 'Featured' }
] as const

export const STYLE_OPTIONS = [
  'Traditional',
  'Neo-Traditional',
  'Realistic',
  'Watercolor',
  'Tribal',
  'Japanese',
  'Blackwork',
  'New School',
  'Minimalist'
] as const 