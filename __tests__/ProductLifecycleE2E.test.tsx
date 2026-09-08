import { useState, useEffect } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AuthProvider } from '@/app/context/AuthContext'
import { CartProvider } from '@/app/context/CartContext'
import { CompareProvider, ProductItem } from '@/app/context/CompareContext'
import ProductDetailClient from '@/app/components/ProductDetailClient'

let globalNavigate: (href: string) => void = () => { }

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: (url: string) => globalNavigate(url),
    replace: (url: string) => globalNavigate(url),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/product/1',
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

// Mock dummyjson server actions
jest.mock('@/app/actions', () => ({
  updateProduct: jest.fn().mockImplementation(async (id, data) => ({
    success: true,
    data: { id, ...data },
  })),
  deleteProduct: jest.fn().mockImplementation(async (id) => ({
    success: true,
    data: { id, isDeleted: true },
  })),
  addCartApi: jest.fn().mockResolvedValue({ success: true }),
}))

const initialMockProduct: ProductItem = {
  id: 1,
  title: 'Wireless Noise-Cancelling Headphones',
  price: 99.99,
  discountPercentage: 0,
  category: 'electronics',
  brand: 'AudioTech',
  rating: 4.7,
  stock: 20,
  description: 'Premium wireless headphones.',
  thumbnail: 'https://example.com/headphones.jpg',
}

function ProductLifecycleHarness({
  initialProduct = initialMockProduct,
}: {
  initialProduct?: ProductItem
}) {
  const [currentRoute, setCurrentRoute] = useState<string>('/product/1')

  useEffect(() => {
    globalNavigate = (href: string) => {
      setCurrentRoute(href)
    }
  }, [])

  return (
    <AuthProvider>
      <CartProvider>
        <CompareProvider>
          {currentRoute === '/product/1' ? (
            <ProductDetailClient initialProduct={initialProduct} />
          ) : (
            <div data-testid="catalog-home">
              <h1>Catalog Home</h1>
            </div>
          )}
        </CompareProvider>
      </CartProvider>
    </AuthProvider>
  )
}

describe('End-to-End Test: Product Management Lifecycle (Edit & Delete)', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('hides edit and delete controls from unauthenticated guests', async () => {
    render(<ProductLifecycleHarness />)

    // Wait for product details to load
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Wireless Noise-Cancelling Headphones' })
      ).toBeInTheDocument()
    })

    // Edit and Delete buttons should not exist
    expect(screen.queryByRole('button', { name: /Edit Product/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Delete$/i })).not.toBeInTheDocument()
  })

  it('allows authenticated users to edit product details and reflect updates live', async () => {
    const user = userEvent.setup()

    // Pre-seed authenticated admin session in localStorage
    localStorage.setItem('dummyjson_access_token', 'valid-token')
    localStorage.setItem('dummyjson_refresh_token', 'valid-refresh')
    localStorage.setItem(
      'dummyjson_user',
      JSON.stringify({
        id: 1,
        username: 'admin',
        firstName: 'Admin',
        role: 'admin',
      })
    )

    render(<ProductLifecycleHarness />)

    // Authenticated user sees "Edit Product" button
    const editBtn = await screen.findByRole('button', { name: /Edit Product/i })
    expect(editBtn).toBeInTheDocument()

    // Open Edit Modal
    await user.click(editBtn)

    // Modal opens
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Edit Product #1/i })).toBeInTheDocument()
    })

    // Edit Title and Price
    const titleInput = screen.getByDisplayValue('Wireless Noise-Cancelling Headphones')
    const priceInput = screen.getByDisplayValue('99.99')

    await user.clear(titleInput)
    await user.type(titleInput, 'Upgraded Wireless Headphones Pro')
    await user.clear(priceInput)
    await user.type(priceInput, '129.99')

    // Submit Edit Form
    const saveBtn = screen.getByRole('button', { name: /Save Changes/i })
    await user.click(saveBtn)

    // Verify modal closes and product detail page displays updated values
    await waitFor(
      () => {
        expect(
          screen.getByRole('heading', { name: 'Upgraded Wireless Headphones Pro' })
        ).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
    expect(screen.getByText('$129.99')).toBeInTheDocument()
  })

  it('allows authenticated users to cancel or confirm product deletion and redirects to catalog', async () => {
    const user = userEvent.setup()

    // Pre-seed authenticated admin session
    localStorage.setItem('dummyjson_access_token', 'valid-token')
    localStorage.setItem('dummyjson_refresh_token', 'valid-refresh')
    localStorage.setItem(
      'dummyjson_user',
      JSON.stringify({
        id: 1,
        username: 'admin',
        firstName: 'Admin',
        role: 'admin',
      })
    )

    render(<ProductLifecycleHarness />)

    // Find and click Delete button
    const deleteBtn = await screen.findByRole('button', { name: /^Delete$/i })
    await user.click(deleteBtn)

    // Confirmation dialog opens
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Delete Product #1\?/i })
      ).toBeInTheDocument()
    })

    // Test cancellation
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i })
    await user.click(cancelBtn)

    // Dialog closes, still on product page
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Delete Product #1\?/i })).not.toBeInTheDocument()
    })

    // Open Delete dialog again and confirm
    await user.click(deleteBtn)
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Delete Product #1\?/i })
      ).toBeInTheDocument()
    })

    const confirmDeleteBtn = screen.getByRole('button', { name: /Confirm Delete/i })
    await user.click(confirmDeleteBtn)

    // Dialog triggers deletion and redirects to catalog home
    await waitFor(
      () => {
        expect(screen.getByTestId('catalog-home')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })
})
