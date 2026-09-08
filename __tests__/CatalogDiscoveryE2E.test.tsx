import { useState, useEffect } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AuthProvider } from '@/app/context/AuthContext'
import { CartProvider } from '@/app/context/CartContext'
import { CompareProvider, ProductItem } from '@/app/context/CompareContext'
import SearchBox from '@/app/components/SearchBox'
import SortDropdown from '@/app/components/SortDropdown'
import ProductsGrid from '@/app/components/ProductsGrid'
import Pagination from '@/app/components/Pagination'

let globalNavigate: (href: string) => void = () => { }
let globalSearchQuery = ''

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: (url: string) => globalNavigate(url),
    replace: (url: string) => globalNavigate(url),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => {
    return new URLSearchParams(globalSearchQuery)
  },
}))

jest.mock('next/link', () => {
  return ({ children, href, onClick, ...rest }: any) => {
    return (
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault()
          if (onClick) onClick(e)
          globalNavigate(href)
        }}
        {...rest}
      >
        {children}
      </a>
    )
  }
})

const catalogProducts: ProductItem[] = [
  {
    id: 1,
    title: 'Wireless Noise-Cancelling Headphones',
    price: 99.99,
    discountPercentage: 10,
    category: 'electronics',
    brand: 'AudioTech',
    rating: 4.5,
    stock: 20,
    thumbnail: 'https://example.com/headphones.jpg',
  },
  {
    id: 2,
    title: 'Ergonomic Mechanical Keyboard',
    price: 149.5,
    discountPercentage: 0,
    category: 'electronics',
    brand: 'KeyPro',
    rating: 4.9,
    stock: 15,
    thumbnail: 'https://example.com/keyboard.jpg',
  },
  {
    id: 3,
    title: 'Minimalist Leather Wallet',
    price: 39.99,
    discountPercentage: 5,
    category: 'accessories',
    brand: 'StyleCo',
    rating: 4.2,
    stock: 50,
    thumbnail: 'https://example.com/wallet.jpg',
  },
]

function CatalogHarness() {
  const [urlParams, setUrlParams] = useState<string>('')

  useEffect(() => {
    globalNavigate = (url: string) => {
      const q = url.includes('?') ? url.split('?')[1] : ''
      globalSearchQuery = q
      setUrlParams(q)
    }
  }, [])

  const params = new URLSearchParams(urlParams)
  const searchQuery = params.get('query')?.toLowerCase() || ''
  const sortBy = params.get('sortBy') || ''
  const order = params.get('order') || ''
  const currentPage = parseInt(params.get('page') || '1', 10)

  // Filter products by query
  let filtered = catalogProducts.filter((p) => {
    if (!searchQuery) return true
    return (
      p.title.toLowerCase().includes(searchQuery) ||
      p.category.toLowerCase().includes(searchQuery) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery))
    )
  })

  // Sort products
  if (sortBy === 'price') {
    filtered = [...filtered].sort((a, b) =>
      order === 'asc' ? a.price - b.price : b.price - a.price
    )
  } else if (sortBy === 'title') {
    filtered = [...filtered].sort((a, b) =>
      order === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    )
  }

  return (
    <AuthProvider>
      <CartProvider>
        <CompareProvider>
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <SearchBox placeholder="Search products..." />
              </div>
              <SortDropdown />
            </div>

            <div className="text-sm font-semibold text-gray-700">
              Showing {filtered.length} products
            </div>

            <ProductsGrid products={filtered} />

            <Pagination
              currentPage={currentPage}
              totalPages={2}
              totalItems={catalogProducts.length}
              limit={2}
            />
          </div>
        </CompareProvider>
      </CartProvider>
    </AuthProvider>
  )
}

describe('End-to-End Test: Catalog Search, Sort, and Filtering Discovery', () => {
  beforeEach(() => {
    globalSearchQuery = ''
    jest.clearAllMocks()
  })

  it('searches products in real-time, filters results, and handles empty search states', async () => {
    const user = userEvent.setup()

    render(<CatalogHarness />)

    // 1. Initially all 3 products are visible
    expect(screen.getByText('Wireless Noise-Cancelling Headphones')).toBeInTheDocument()
    expect(screen.getByText('Ergonomic Mechanical Keyboard')).toBeInTheDocument()
    expect(screen.getByText('Minimalist Leather Wallet')).toBeInTheDocument()

    // 2. Type "keyboard" into the SearchBox
    const searchInput = screen.getByPlaceholderText('Search products...')
    await user.type(searchInput, 'keyboard')

    // Wait for debounced search to filter products
    await waitFor(() => {
      expect(screen.getByText('Ergonomic Mechanical Keyboard')).toBeInTheDocument()
      expect(
        screen.queryByText('Wireless Noise-Cancelling Headphones')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('Minimalist Leather Wallet')
      ).not.toBeInTheDocument()
    })

    // 3. Type non-matching query to test empty state
    await user.clear(searchInput)
    await user.type(searchInput, 'nonexistentxyz')

    await waitFor(() => {
      expect(screen.getByText('No products found')).toBeInTheDocument()
      expect(
        screen.getByText('Try adjusting your search query or filters.')
      ).toBeInTheDocument()
    })

    // 4. Clear search box to restore full catalog
    await user.clear(searchInput)

    await waitFor(() => {
      expect(screen.getByText('Wireless Noise-Cancelling Headphones')).toBeInTheDocument()
      expect(screen.getByText('Ergonomic Mechanical Keyboard')).toBeInTheDocument()
      expect(screen.getByText('Minimalist Leather Wallet')).toBeInTheDocument()
    })
  })

  it('sorts catalog products by price ascending and descending', async () => {
    const user = userEvent.setup()

    render(<CatalogHarness />)

    const sortSelect = screen.getByLabelText(/Sort by:/i)

    // Sort by Price: Low to High
    await user.selectOptions(sortSelect, 'price-asc')

    await waitFor(() => {
      // Wallet is lowest ($39.99), then Headphones ($99.99), then Keyboard ($149.50)
      const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
      expect(titles[0]).toBe('Minimalist Leather Wallet')
      expect(titles[1]).toBe('Wireless Noise-Cancelling Headphones')
      expect(titles[2]).toBe('Ergonomic Mechanical Keyboard')
    })

    // Sort by Price: High to Low
    await user.selectOptions(sortSelect, 'price-desc')

    await waitFor(() => {
      const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
      expect(titles[0]).toBe('Ergonomic Mechanical Keyboard')
      expect(titles[1]).toBe('Wireless Noise-Cancelling Headphones')
      expect(titles[2]).toBe('Minimalist Leather Wallet')
    })
  })
})
