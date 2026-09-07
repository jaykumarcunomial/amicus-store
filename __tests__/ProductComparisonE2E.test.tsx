import { useState, useEffect } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CartProvider } from '@/app/context/CartContext'
import { AuthProvider } from '@/app/context/AuthContext'
import { CompareProvider, ProductItem } from '@/app/context/CompareContext'
import ProductsGrid from '@/app/components/ProductsGrid'
import ProductDetailClient from '@/app/components/ProductDetailClient'
import CompareFloatingBar from '@/app/components/CompareFloatingBar'
import ComparePage from '@/app/compare/page'
import CartDrawer from '@/app/components/CartDrawer'
import TopNavigation from '@/app/components/TopNavigation'

// Client-side routing simulator
let globalNavigate: (href: string) => void = () => { }

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: (url: string) => globalNavigate(url),
    replace: (url: string) => globalNavigate(url),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
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

// Mock dummyjson server actions for cart and products
jest.mock('@/app/actions', () => ({
  addCartApi: jest.fn().mockResolvedValue({ success: true, data: { id: 42 } }),
  updateCartApi: jest.fn().mockResolvedValue({ success: true, data: { id: 42 } }),
  deleteCartApi: jest.fn().mockResolvedValue({ success: true, data: { id: 42 } }),
  editProduct: jest.fn().mockResolvedValue({ success: true }),
  deleteProduct: jest.fn().mockResolvedValue({ success: true }),
}))

const mockProducts: ProductItem[] = [
  {
    id: 1,
    title: 'Wireless Noise-Cancelling Headphones',
    price: 99.99,
    discountPercentage: 10,
    category: 'electronics',
    brand: 'AudioTech',
    rating: 4.7,
    stock: 20,
    description: 'Premium wireless headphones with active noise cancellation and 30-hour battery life.',
    thumbnail: 'https://example.com/headphones-thumb.jpg',
    images: ['https://example.com/headphones-1.jpg'],
    shippingInformation: 'Free 2-day delivery',
    warrantyInformation: '1-Year Warranty',
    returnPolicy: '30-Day Return',
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
    description: 'Hot-swappable mechanical keyboard with RGB backlighting and tactile switches.',
    thumbnail: 'https://example.com/keyboard-thumb.jpg',
    images: ['https://example.com/keyboard-1.jpg'],
    shippingInformation: 'Free standard shipping',
    warrantyInformation: '2-Year Warranty',
    returnPolicy: '30-Day Return',
  },
]

function TestCompareAppHarness({ initialRoute = '/' }: { initialRoute?: string }) {
  const [route, setRoute] = useState<string>(initialRoute)
  const [activeProductId, setActiveProductId] = useState<number>(1)

  useEffect(() => {
    globalNavigate = (href: string) => {
      if (href.startsWith('/product/')) {
        const id = parseInt(href.replace('/product/', ''), 10)
        if (!isNaN(id)) {
          setActiveProductId(id)
        }
      }
      setRoute(href)
    }
  }, [])

  const activeProduct =
    mockProducts.find((p) => p.id === activeProductId) || mockProducts[0]

  return (
    <AuthProvider>
      <CartProvider>
        <CompareProvider>
          {/* Top Navigation */}
          <TopNavigation />

          {/* Main Route Content */}
          <main>
            {route === '/' && (
              <div className="p-4">
                <h1 className="text-xl font-bold mb-4">Product Catalog</h1>
                <ProductsGrid products={mockProducts} />
              </div>
            )}

            {route.startsWith('/product/') && (
              <ProductDetailClient initialProduct={activeProduct} />
            )}

            {route === '/compare' && <ComparePage />}
          </main>

          {/* Persistent Floating Compare Bar & Cart Drawer */}
          <CompareFloatingBar />
          <CartDrawer />
        </CompareProvider>
      </CartProvider>
    </AuthProvider>
  )
}

describe('End-to-End Test: Product Catalog -> Compare Selection -> Comparison Table -> Add to Cart', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('allows user to select products from catalog, review in floating bar, navigate to comparison matrix, and add directly to cart', async () => {
    const user = userEvent.setup()

    render(<TestCompareAppHarness initialRoute="/" />)

    // =========================================================================
    // 1. HOME CATALOG: Initial compare status is empty
    // =========================================================================
    expect(screen.getByRole('heading', { name: /Product Catalog/i })).toBeInTheDocument()

    // Floating bar is initially not in document when no items are selected
    expect(screen.queryByText(/Compare Products/i)).not.toBeInTheDocument()

    // Find compare toggle buttons on product cards
    const compareButtons = screen.getAllByTitle('Add to comparison')
    expect(compareButtons).toHaveLength(2)

    // =========================================================================
    // 2. SELECT PRODUCT 1: Floating bar appears with (1/3)
    // =========================================================================
    await user.click(compareButtons[0])

    // Floating bar appears with status
    expect(screen.getByText('Compare Products (1/3)')).toBeInTheDocument()
    expect(screen.getByText('Select at least 2 products to compare')).toBeInTheDocument()

    // Top Navigation badge displays 1
    const navBar = screen.getByRole('navigation')
    const topNavCompareLink = within(navBar).getByRole('link', { name: /Compare/i })
    expect(topNavCompareLink).toHaveTextContent('1')

    // =========================================================================
    // 3. SELECT PRODUCT 2: Status updates to (2/3) and Compare button becomes ready
    // =========================================================================
    await user.click(compareButtons[1])

    expect(screen.getByText('Compare Products (2/3)')).toBeInTheDocument()
    expect(screen.getByText('Ready to compare side-by-side')).toBeInTheDocument()
    expect(topNavCompareLink).toHaveTextContent('2')

    // =========================================================================
    // 4. NAVIGATE TO COMPARE PAGE
    // =========================================================================
    // Find the Compare button link inside the floating bar
    const floatingBar = screen.getByText('Compare Products (2/3)').closest('div.fixed') as HTMLElement
    const compareNowLink = within(floatingBar).getByRole('link', { name: /Compare/i })
    expect(compareNowLink).toHaveAttribute('href', '/compare')

    await user.click(compareNowLink)

    // =========================================================================
    // 5. COMPARE PAGE: Verifies side-by-side comparison matrix table
    // =========================================================================
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Product Comparison/i })
      ).toBeInTheDocument()
    })
    expect(screen.getByText(/2 of 3 items/i)).toBeInTheDocument()

    // Verify both product titles in the comparison table
    expect(
      screen.getByRole('heading', { name: 'Wireless Noise-Cancelling Headphones' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Ergonomic Mechanical Keyboard' })
    ).toBeInTheDocument()

    // Verify specification rows in the matrix
    expect(screen.getByText('AudioTech')).toBeInTheDocument()
    expect(screen.getByText('KeyPro')).toBeInTheDocument()
    expect(screen.getByText('$99.99')).toBeInTheDocument()
    expect(screen.getByText('$149.50')).toBeInTheDocument()

    // =========================================================================
    // 6. ADD TO CART DIRECTLY FROM COMPARE MATRIX
    // =========================================================================
    // There are "Add to Cart" buttons inside the table headers
    const addToCartButtons = screen.getAllByRole('button', { name: /Add to Cart/i })
    expect(addToCartButtons.length).toBe(2)

    // Add the first product (Headphones) to cart
    await user.click(addToCartButtons[0])

    // Verify CartDrawer slides in with the product
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Shopping Cart \(1\)/i })).toBeInTheDocument()
    })
    // Top navigation cart badge updates to 1
    const topNavCartBtn = screen.getByTitle('Open cart drawer')
    expect(topNavCartBtn).toHaveTextContent('1')
  })

  it('supports adding to compare from product details and clearing comparison matrix to empty state', async () => {
    const user = userEvent.setup()

    // Start on product details page for product 1
    render(<TestCompareAppHarness initialRoute="/product/1" />)

    // Verify details page loaded
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Wireless Noise-Cancelling Headphones' })
      ).toBeInTheDocument()
    })

    // Click "Compare" button on product details page
    const detailCompareBtn = screen.getByTitle('Add to Compare')
    await user.click(detailCompareBtn)

    // Verify button updates to "Remove from Compare"
    expect(screen.getByTitle('Remove from Compare')).toBeInTheDocument()

    // Floating bar appears with (1/3)
    expect(screen.getByText('Compare Products (1/3)')).toBeInTheDocument()

    // Navigate to /compare page
    const navBar = screen.getByRole('navigation')
    const topNavCompareLink = within(navBar).getByRole('link', { name: /Compare/i })
    await user.click(topNavCompareLink)

    // Verify Compare Page shows the single product
    await waitFor(() => {
      expect(screen.getByText(/1 of 3 items/i)).toBeInTheDocument()
    })
    expect(
      screen.getByRole('heading', { name: 'Wireless Noise-Cancelling Headphones' })
    ).toBeInTheDocument()

    // Click "Clear All" button
    const clearAllBtn = screen.getByRole('button', { name: /Clear All/i })
    await user.click(clearAllBtn)

    // Empty state is rendered
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /No Products Selected/i })).toBeInTheDocument()
    })
    expect(
      screen.getByText(/Select 2 or 3 products from the catalog to compare them side by side\./i)
    ).toBeInTheDocument()

    // Clicking "Browse Catalog" takes user back to Home
    const browseCatalogLink = screen.getByRole('link', { name: /Browse Catalog/i })
    await user.click(browseCatalogLink)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Product Catalog/i })).toBeInTheDocument()
    })
  })
})
