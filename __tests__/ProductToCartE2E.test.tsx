import { useState, useEffect } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CartProvider } from '@/app/context/CartContext'
import { AuthProvider } from '@/app/context/AuthContext'
import { CompareProvider, ProductItem } from '@/app/context/CompareContext'
import ProductsGrid from '@/app/components/ProductsGrid'
import ProductDetailClient from '@/app/components/ProductDetailClient'
import CartDrawer from '@/app/components/CartDrawer'
import TopNavigation from '@/app/components/TopNavigation'
import CartPage from '@/app/cart/page'

// Navigation hook simulator
let globalNavigate: (href: string) => void = () => { }

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: (url: string) => globalNavigate(url),
    replace: (url: string) => globalNavigate(url),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next/link to simulate true client-side route transitions
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

// Mock dummyjson server actions
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

/**
 * An interactive test harness that renders the app providers along with
 * TopNavigation, CartDrawer, and dynamic route rendering.
 * It simulates real Next.js client-side navigation between:
 * - Home Catalog ("/")
 * - Product Details ("/product/:id")
 * - Cart Page ("/cart")
 */
function TestAppHarness({ initialRoute = '/' }: { initialRoute?: string }) {
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

          {/* Current Route Indicator for debugging */}
          <div data-testid="current-route" className="sr-only">
            {route}
          </div>

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

            {route === '/cart' && <CartPage />}
          </main>

          {/* Slide-over Cart Drawer */}
          <CartDrawer />
        </CompareProvider>
      </CartProvider>
    </AuthProvider>
  )
}

describe('End-to-End Test: Product Discovery -> Details -> Cart Drawer -> Cart Page', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('completes the entire user journey from seeing a product on Home, viewing Details, adding 2 items to cart, and checking Cart Page', async () => {
    const user = userEvent.setup()

    render(<TestAppHarness initialRoute="/" />)

    // =========================================================================
    // 1. HOME PAGE: User discovers the product in the catalog
    // =========================================================================
    expect(screen.getByRole('heading', { name: /Product Catalog/i })).toBeInTheDocument()

    const productTitleLink = screen.getByRole('link', {
      name: 'Wireless Noise-Cancelling Headphones',
    })
    expect(productTitleLink).toBeInTheDocument()
    expect(productTitleLink).toHaveAttribute('href', '/product/1')

    // Verify initial cart badge in top nav is 0
    const topNavCartBtn = screen.getByTitle('Open cart drawer')
    expect(topNavCartBtn).toHaveTextContent('0')

    // =========================================================================
    // 2. NAVIGATE TO PRODUCT DETAILS: User clicks product link
    // =========================================================================
    await user.click(productTitleLink)

    // Verify Product Details page is displayed
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Wireless Noise-Cancelling Headphones' })
      ).toBeInTheDocument()
    })
    expect(screen.getByText('$99.99')).toBeInTheDocument()
    expect(screen.getByText(/In Stock \(20 available\)/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Premium wireless headphones with active noise cancellation/i)
    ).toBeInTheDocument()

    // =========================================================================
    // 3. PRODUCT DETAILS: User increments quantity to 2 and clicks Add to Cart
    // =========================================================================
    const plusBtn = screen.getByRole('button', { name: '+' })
    await user.click(plusBtn)

    // Quantity updates to 2
    expect(screen.getByText('2')).toBeInTheDocument()

    // Click "Add to Cart"
    const addToCartBtn = screen.getByRole('button', { name: /Add to Cart/i })
    await user.click(addToCartBtn)

    // =========================================================================
    // 4. CART DRAWER: Automatically opens and displays cart contents
    // =========================================================================
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Shopping Cart \(2\)/i })).toBeInTheDocument()
    })

    // Subtotal inside drawer: 2 * 99.99 = $199.98
    expect(screen.getByText('$199.98')).toBeInTheDocument()

    // Top navigation counter reflects 2 items
    expect(topNavCartBtn).toHaveTextContent('2')

    // =========================================================================
    // 5. NAVIGATE TO CART PAGE: User clicks "View Cart & Checkout"
    // =========================================================================
    const viewCartLink = screen.getByRole('link', { name: /View Cart & Checkout/i })
    expect(viewCartLink).toHaveAttribute('href', '/cart')
    await user.click(viewCartLink)

    // =========================================================================
    // 6. CART PAGE: Verifies item details, pricing, and order summary
    // =========================================================================
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Shopping Cart \(2 items\)/i })
      ).toBeInTheDocument()
    })

    // Item line in Cart Page
    const cartItemHeading = screen.getByRole('heading', {
      name: 'Wireless Noise-Cancelling Headphones',
    })
    expect(cartItemHeading).toBeInTheDocument()
    expect(screen.getByText(/Unit Price: \$99.99/i)).toBeInTheDocument()

    // Order Summary block
    expect(screen.getByRole('heading', { name: /Order Summary/i })).toBeInTheDocument()
    expect(screen.getByText('Subtotal')).toBeInTheDocument()
    expect(screen.getByText('Estimated Shipping')).toBeInTheDocument()
    expect(screen.getByText('FREE')).toBeInTheDocument()

    // Total price is $199.98
    const totalPrices = screen.getAllByText('$199.98')
    expect(totalPrices.length).toBeGreaterThanOrEqual(1)

    // Unauthenticated user call-to-action
    expect(screen.getByRole('link', { name: /Sign in to Checkout/i })).toHaveAttribute(
      'href',
      '/login?redirect=/cart'
    )
  })

  it('supports modifying item quantities and removing items directly inside Cart Page', async () => {
    const user = userEvent.setup()

    // Start on product 1 details page
    render(<TestAppHarness initialRoute="/product/1" />)

    // Add 1 item
    const addToCartBtn = await screen.findByRole('button', { name: /Add to Cart/i })
    await user.click(addToCartBtn)

    // Click "View Cart & Checkout" from the drawer
    const viewCartLink = await screen.findByRole('link', { name: /View Cart & Checkout/i })
    await user.click(viewCartLink)

    // Ensure we are on the Cart Page
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Shopping Cart \(1 items\)/i })
      ).toBeInTheDocument()
    })

    // Find the Cart item row container
    const itemHeading = screen.getByRole('heading', {
      name: 'Wireless Noise-Cancelling Headphones',
    })
    const cartRow = itemHeading.closest('div.bg-white') as HTMLElement
    expect(cartRow).toBeInTheDocument()

    // Find the Plus button inside the item row
    const buttonsInRow = within(cartRow).getAllByRole('button')
    // buttons: [Minus, Plus, Trash]
    expect(buttonsInRow.length).toBe(3)
    const minusBtn = buttonsInRow[0]
    const plusBtn = buttonsInRow[1]
    const trashBtn = buttonsInRow[2]

    // Increment quantity from 1 to 2
    await user.click(plusBtn)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Shopping Cart \(2 items\)/i })
      ).toBeInTheDocument()
    })
    expect(screen.getAllByText('$199.98').length).toBeGreaterThan(0)

    // Decrement quantity back to 1
    await user.click(minusBtn)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Shopping Cart \(1 items\)/i })
      ).toBeInTheDocument()
    })
    expect(screen.getAllByText('$99.99').length).toBeGreaterThan(0)

    // Click trash button to delete item from cart
    await user.click(trashBtn)

    // Verify empty cart state
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Your Cart is Empty/i })).toBeInTheDocument()
    })
    expect(
      screen.getByText(/Looks like you haven't added any products to your cart yet\./i)
    ).toBeInTheDocument()

    // Clicking "Start Shopping" brings user back to catalog
    const startShoppingLink = screen.getByRole('link', { name: /Start Shopping/i })
    await user.click(startShoppingLink)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Product Catalog/i })).toBeInTheDocument()
    })
  })

  it('manages multiple products in cart and allows clearing entire cart via Clear Cart button', async () => {
    const user = userEvent.setup()

    render(<TestAppHarness initialRoute="/" />)

    // Add first product directly from catalog quick-add
    const addButtons = screen.getAllByTitle('Add to Cart')
    expect(addButtons.length).toBe(2)

    await user.click(addButtons[0]) // Adds Headphones ($99.99)

    // Close drawer by clicking the backdrop overlay
    const backdrop = document.querySelector('.backdrop-blur-xs') as HTMLElement
    if (backdrop) {
      await user.click(backdrop)
    }

    // Navigate to second product from catalog
    const keyboardLink = screen.getByRole('link', { name: 'Ergonomic Mechanical Keyboard' })
    await user.click(keyboardLink)

    // Add second product from its details page
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Ergonomic Mechanical Keyboard' })
      ).toBeInTheDocument()
    })
    const addToCartBtn = screen.getByRole('button', { name: /Add to Cart/i })
    await user.click(addToCartBtn) // Adds Keyboard ($149.50)

    // Go to Cart Page
    const viewCartLink = await screen.findByRole('link', { name: /View Cart & Checkout/i })
    await user.click(viewCartLink)

    // Both items are present (total = 2 items)
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Shopping Cart \(2 items\)/i })
      ).toBeInTheDocument()
    })
    expect(
      screen.getByRole('heading', { name: 'Wireless Noise-Cancelling Headphones' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Ergonomic Mechanical Keyboard' })
    ).toBeInTheDocument()

    // Subtotal: 99.99 + 149.50 = $249.49
    expect(screen.getAllByText('$249.49').length).toBeGreaterThan(0)

    // Click "Clear Cart" button
    const clearCartBtn = screen.getByRole('button', { name: /Clear Cart/i })
    await user.click(clearCartBtn)

    // Verify Empty Cart State is shown
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Your Cart is Empty/i })).toBeInTheDocument()
    })

    // Top Navigation badge resets to 0
    const topNavCartBtn = screen.getByTitle('Open cart drawer')
    expect(topNavCartBtn).toHaveTextContent('0')
  })
})
