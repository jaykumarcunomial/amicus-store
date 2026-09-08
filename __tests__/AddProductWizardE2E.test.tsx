import { useState, useEffect } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AuthProvider } from '@/app/context/AuthContext'
import AddProductPage from '@/app/product/add/page'

let globalNavigate: (href: string) => void = () => { }

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: (url: string) => globalNavigate(url),
    replace: (url: string) => globalNavigate(url),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/product/add',
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
  getAllProductCategories: jest.fn().mockResolvedValue([
    { slug: 'smartphones', name: 'Smartphones' },
    { slug: 'laptops', name: 'Laptops' },
    { slug: 'fragrances', name: 'Fragrances' },
  ]),
  addProduct: jest.fn().mockImplementation(async (payload) => ({
    success: true,
    data: {
      id: 999,
      ...payload,
    },
  })),
}))

// Mock auth action
jest.mock('@/app/actions/auth', () => ({
  loginUser: jest.fn(),
  getAuthUser: jest.fn().mockResolvedValue({ success: false }),
  refreshAccessToken: jest.fn().mockResolvedValue({ success: false }),
}))

function WizardTestHarness() {
  return (
    <AuthProvider>
      <AddProductPage />
    </AuthProvider>
  )
}

describe('End-to-End Test: Multi-Step Product Creation Wizard Flow', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('blocks unauthenticated guests from accessing the wizard and displays login call-to-action', async () => {
    render(<WizardTestHarness />)

    // Verify auth-gate screen
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Authentication Required/i })
      ).toBeInTheDocument()
    })
    expect(
      screen.getByText(/You must be signed in to add new products to the catalog\./i)
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Sign in to Continue/i })).toHaveAttribute(
      'href',
      '/login?redirect=/product/add'
    )
  })

  it('guides authenticated users through all 4 wizard steps with validation and successfully publishes a new product', async () => {
    const user = userEvent.setup()

    // Pre-seed localStorage before mounting AuthProvider
    localStorage.setItem('dummyjson_access_token', 'valid-token')
    localStorage.setItem('dummyjson_refresh_token', 'valid-refresh')
    localStorage.setItem(
      'dummyjson_user',
      JSON.stringify({
        id: 1,
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
      })
    )

    render(<WizardTestHarness />)

    // Wait for auth initialization and Wizard rendering
    await waitFor(() => {
      expect(screen.getByText(/Step 1: Select Category/i)).toBeInTheDocument()
    })

    // STEP 1: Category Selection
    // Verify required category validation
    const nextBtn = screen.getByRole('button', { name: /Continue to Step 2/i })
    await user.click(nextBtn)

    // Shows validation error when no category is picked
    await waitFor(() => {
      expect(
        screen.getByText(/Please select a product category to proceed\./i)
      ).toBeInTheDocument()
    })

    // Select category "Smartphones"
    const smartphonesBtn = await screen.findByRole('button', { name: /Smartphones/i })
    await user.click(smartphonesBtn)

    // Click Next to Step 2
    await user.click(nextBtn)

    // STEP 2: Brand & Tags
    await waitFor(() => {
      expect(screen.getByText(/Step 2:/i)).toBeInTheDocument()
    })

    // Fill in Title and Brand
    const titleInput = screen.getByPlaceholderText(/e\.g\. Ultra Slim Wireless Headphones/i)
    const brandInput = screen.getByPlaceholderText(/e\.g\. Sony, Apple, Nike/i)

    await user.type(titleInput, 'Super Flagship Pro Phone')
    await user.type(brandInput, 'FutureTech')

    // Click Next to Step 3
    const nextStep3Btn = screen.getByRole('button', { name: /Continue to Step 3/i })
    await user.click(nextStep3Btn)

    // STEP 3: Dimensions & Physical Specs
    await waitFor(() => {
      expect(screen.getByText(/Step 3: Dimensions/i)).toBeInTheDocument()
    })

    // Defaults are pre-populated (width, height, depth, weight)
    const nextStep4Btn = screen.getByRole('button', { name: /Continue to Step 4/i })
    await user.click(nextStep4Btn)

    // STEP 4: Pricing, Stock & Review
    await waitFor(() => {
      expect(screen.getByText(/Step 4: Price & Inventory/i)).toBeInTheDocument()
    })

    // Enter Price
    const priceInput = screen.getByPlaceholderText(/e\.g\. 49\.99/i)
    await user.type(priceInput, '799.99')

    // Click "Submit & Create Product" button
    const publishBtn = screen.getByRole('button', { name: /Submit & Create Product/i })
    await user.click(publishBtn)

    // VERIFY SUBMISSION SUCCESS
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Product Successfully Added!/i })
      ).toBeInTheDocument()
    })
    expect(screen.getByText('Super Flagship Pro Phone')).toBeInTheDocument()
    expect(screen.getByText('#999')).toBeInTheDocument()
  })
})
