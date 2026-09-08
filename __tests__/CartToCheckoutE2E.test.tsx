import { useState, useEffect } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CartProvider } from '@/app/context/CartContext'
import { AuthProvider } from '@/app/context/AuthContext'
import { CompareProvider, ProductItem } from '@/app/context/CompareContext'
import ProductsGrid from '@/app/components/ProductsGrid'
import CartPage from '@/app/cart/page'
import LoginPage from '@/app/login/page'
import TopNavigation from '@/app/components/TopNavigation'
import CartDrawer from '@/app/components/CartDrawer'

let globalNavigate: (href: string) => void = () => { }

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: (url: string) => globalNavigate(url),
    replace: (url: string) => globalNavigate(url),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => {
    // Return mock search params based on current simulated route query
    const query = globalCurrentRoute.includes('?')
      ? globalCurrentRoute.split('?')[1]
      : ''
    return new URLSearchParams(query)
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

// Mock dummyjson API actions
jest.mock('@/app/actions', () => ({
  addCartApi: jest.fn().mockResolvedValue({ success: true, data: { id: 42 } }),
  updateCartApi: jest.fn().mockResolvedValue({ success: true, data: { id: 42 } }),
  deleteCartApi: jest.fn().mockResolvedValue({ success: true, data: { id: 42 } }),
}))

// Mock auth actions
jest.mock('@/app/actions/auth', () => {
  const user = {
    id: 1,
    username: 'emilys',
    email: 'emily.johnson@x.dummyjson.com',
    firstName: 'Emily',
    lastName: 'Johnson',
    gender: 'female',
    image: 'https://dummyjson.com/icon/emilys/128',
    accessToken: 'mock-access-token-12345',
    refreshToken: 'mock-refresh-token-67890',
  }

  return {
    loginUser: jest.fn().mockImplementation(async (creds) => {
      if (creds.username === 'emilys' && creds.password === 'emilyspass') {
        return {
          success: true,
          data: user,
        }
      }
      return {
        success: false,
        error: 'Invalid username or password',
      }
    }),
    getAuthUser: jest.fn().mockResolvedValue({ success: true, data: user }),
    refreshAccessToken: jest.fn().mockResolvedValue({
      success: true,
      data: { accessToken: 'new-token', refreshToken: 'new-refresh' },
    }),
  }
})

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
    description: 'Premium wireless headphones with active noise cancellation.',
    thumbnail: 'https://example.com/headphones.jpg',
  },
]

let globalCurrentRoute = '/'

function CheckoutTestHarness({ initialRoute = '/' }: { initialRoute?: string }) {
  const [route, setRoute] = useState<string>(initialRoute)

  useEffect(() => {
    globalCurrentRoute = route
  }, [route])

  useEffect(() => {
    globalNavigate = (href: string) => {
      globalCurrentRoute = href
      setRoute(href)
    }
  }, [])

  const currentPath = route.split('?')[0]

  return (
    <AuthProvider>
      <CartProvider>
        <CompareProvider>
          <TopNavigation />

          <main className="p-4">
            {currentPath === '/' && (
              <div>
                <h1 className="text-xl font-bold mb-4">Store Catalog</h1>
                <ProductsGrid products={mockProducts} />
              </div>
            )}

            {currentPath === '/cart' && <CartPage />}

            {currentPath === '/login' && <LoginPage />}
          </main>

          <CartDrawer />
        </CompareProvider>
      </CartProvider>
    </AuthProvider>
  )
}

describe('End-to-End Test: Cart to Authentication to Checkout Funnel', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
    window.alert = jest.fn()
  })

  it('navigates guest from cart to login, authenticates, redirects back, and completes checkout', async () => {
    const user = userEvent.setup()

    render(<CheckoutTestHarness initialRoute="/" />)

    // 1. GUEST ADDS ITEM TO CART
    const addBtn = screen.getByTitle('Add to Cart')
    await user.click(addBtn)

    // 2. NAVIGATE TO CART PAGE VIA CART DRAWER LINK
    const viewCartLink = await screen.findByRole('link', { name: /View Cart & Checkout/i })
    await user.click(viewCartLink)

    // 3. CART PAGE DISPLAYS "Sign in to Checkout" FOR UNAUTHENTICATED GUEST
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Shopping Cart \(1 items\)/i })
      ).toBeInTheDocument()
    })
    const signInLink = screen.getByRole('link', { name: /Sign in to Checkout/i })
    expect(signInLink).toHaveAttribute('href', '/login?redirect=/cart')

    // 4. CLICK "Sign in to Checkout" -> NAVIGATES TO LOGIN PAGE WITH REDIRECT QUERY
    await user.click(signInLink)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Sign in to your account/i })
      ).toBeInTheDocument()
    })

    // 5. FILL OUT LOGIN CREDENTIALS
    const usernameInput = document.getElementById('login-username') as HTMLInputElement
    const passwordInput = document.getElementById('login-password') as HTMLInputElement
    expect(usernameInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()

    await user.clear(usernameInput)
    await user.type(usernameInput, 'emilys')
    await user.clear(passwordInput)
    await user.type(passwordInput, 'emilyspass')

    // 6. SUBMIT LOGIN FORM
    const submitBtn = screen.getByRole('button', { name: /^Sign in$/i })
    await user.click(submitBtn)

    // Verify success banner and redirection back to /cart
    await waitFor(
      () => {
        expect(
          screen.getByRole('heading', { name: /Shopping Cart \(1 items\)/i })
        ).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // 7. CART PAGE NOW SHOWS "Proceed to Checkout" BUTTON
    const checkoutBtn = screen.getByRole('button', { name: /Proceed to Checkout/i })
    expect(checkoutBtn).toBeInTheDocument()

    // 8. CLICK "Proceed to Checkout"
    await user.click(checkoutBtn)
    expect(window.alert).toHaveBeenCalledWith('Checkout simulation successful! Order placed.')

    // 9. VERIFY TOP NAVIGATION UPDATES WITH AUTHENTICATED USER INFO
    expect(screen.getByText('Emily Johnson')).toBeInTheDocument()
  })
})
