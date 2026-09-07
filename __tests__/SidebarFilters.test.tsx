import React, { act } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SidebarFilters from '@/app/components/SidebarFilters'
import { getAllProductCategories } from '@/app/actions'

// 1. Mock Next.js navigation hooks
const mockReplace = jest.fn()
let mockPathname = '/'
let mockSearchParams = new URLSearchParams()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}))

// 2. Mock Server Actions
jest.mock('@/app/actions', () => ({
  getAllProductCategories: jest.fn(),
}))

describe('SidebarFilters Component', () => {
  const mockCategories = [
    { slug: 'beauty', name: 'Beauty' },
    { slug: 'fragrances', name: 'Fragrances' },
    { slug: 'groceries', name: 'Groceries' },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockPathname = '/'
    mockSearchParams = new URLSearchParams()
    ;(getAllProductCategories as jest.Mock).mockResolvedValue(mockCategories)
  })

  // Helper to render and wait for initial categories loading to settle
  const renderSidebarFilters = async (children: React.ReactNode = <div>Child Content</div>) => {
    let renderResult: ReturnType<typeof render>
    await act(async () => {
      renderResult = render(<SidebarFilters>{children}</SidebarFilters>)
    })
    return renderResult!
  }

  // --- 1. Route Guarding ---
  describe('Route Guarding', () => {
    it('only renders children without sidebar or header when on a non-home route', async () => {
      mockPathname = '/products/1'

      await renderSidebarFilters(
        <div data-testid="child-content">Product Details Page</div>
      )

      // Children should be present
      expect(screen.getByTestId('child-content')).toBeInTheDocument()

      // Header, banner, and filters should NOT be rendered
      expect(screen.queryByRole('heading', { name: /new arrivals/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: /filters/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('radio', { name: /all categories/i })).not.toBeInTheDocument()
    })
  })

  // --- 2. Category Fetching & Loading States ---
  describe('Category Loading & Error Handling', () => {
    it('displays loading indicator while categories are being fetched', async () => {
      // Pending promise to simulate in-flight network request
      let resolvePromise: (value: typeof mockCategories) => void
      const pendingPromise = new Promise<typeof mockCategories>((resolve) => {
        resolvePromise = resolve
      })
      ;(getAllProductCategories as jest.Mock).mockReturnValue(pendingPromise)

      render(
        <SidebarFilters>
          <div>Child Grid</div>
        </SidebarFilters>
      )

      expect(screen.getByText(/loading categories.../i)).toBeInTheDocument()
      expect(screen.getByLabelText(/all categories/i)).toBeInTheDocument()

      // Clean up promise to avoid open handles
      await act(async () => {
        resolvePromise!(mockCategories)
      })
    })

    it('renders categories successfully and hides loading indicator once loaded', async () => {
      await renderSidebarFilters()

      // Loading indicator should disappear
      expect(screen.queryByText(/loading categories.../i)).not.toBeInTheDocument()

      // Verify category radio options and labels are in the document
      expect(screen.getByRole('radio', { name: /all categories/i })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /beauty/i })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /fragrances/i })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /groceries/i })).toBeInTheDocument()
    })

    it('supports categories returned as plain strings (legacy/fallback format)', async () => {
      ;(getAllProductCategories as jest.Mock).mockResolvedValue(['electronics', 'furniture'])

      await renderSidebarFilters()

      expect(screen.getByRole('radio', { name: /electronics/i })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /furniture/i })).toBeInTheDocument()
    })

    it('handles category fetch error gracefully without crashing', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      ;(getAllProductCategories as jest.Mock).mockRejectedValue(new Error('Network error'))

      await renderSidebarFilters(
        <div data-testid="child-content">Child Grid</div>
      )

      // Loading indicator should disappear even on error
      expect(screen.queryByText(/loading categories.../i)).not.toBeInTheDocument()

      // Child content and default "All Categories" radio should still be rendered
      expect(screen.getByTestId('child-content')).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /all categories/i })).toBeInTheDocument()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load categories:', expect.any(Error))

      consoleErrorSpy.mockRestore()
    })
  })

  // --- 3. Initial State & URL Synchronization ---
  describe('Selection State & URL Synchronization', () => {
    it('selects "All Categories" by default when no category param exists', async () => {
      await renderSidebarFilters()

      const allRadio = screen.getByRole('radio', { name: /all categories/i }) as HTMLInputElement
      const beautyRadio = screen.getByRole('radio', { name: /beauty/i }) as HTMLInputElement

      expect(allRadio.checked).toBe(true)
      expect(beautyRadio.checked).toBe(false)
    })

    it('selects the corresponding category radio when category param exists in URL', async () => {
      mockSearchParams = new URLSearchParams('category=fragrances')

      await renderSidebarFilters()

      const allRadio = screen.getByRole('radio', { name: /all categories/i }) as HTMLInputElement
      const fragrancesRadio = screen.getByRole('radio', { name: /fragrances/i }) as HTMLInputElement
      const beautyRadio = screen.getByRole('radio', { name: /beauty/i }) as HTMLInputElement

      expect(fragrancesRadio.checked).toBe(true)
      expect(allRadio.checked).toBe(false)
      expect(beautyRadio.checked).toBe(false)
    })
  })

  // --- 4. User Interaction & Query Parameter Updates ---
  describe('User Interactions & Navigation', () => {
    it('navigates to selected category, resetting page to 1 with scroll disabled', async () => {
      const user = userEvent.setup()

      await renderSidebarFilters()

      const beautyRadio = screen.getByRole('radio', { name: /beauty/i })
      await user.click(beautyRadio)

      expect(mockReplace).toHaveBeenCalledTimes(1)
      expect(mockReplace).toHaveBeenCalledWith('/?category=beauty&page=1', { scroll: false })
    })

    it('removes category parameter when "All Categories" is selected', async () => {
      mockSearchParams = new URLSearchParams('category=beauty&page=3')
      const user = userEvent.setup()

      await renderSidebarFilters()

      const allRadio = screen.getByRole('radio', { name: /all categories/i })
      await user.click(allRadio)

      expect(mockReplace).toHaveBeenCalledTimes(1)
      expect(mockReplace).toHaveBeenCalledWith('/?page=1', { scroll: false })
    })

    it('clears active search query parameter and resets page to 1 when a category is selected', async () => {
      mockSearchParams = new URLSearchParams('query=perfume&page=2')
      const user = userEvent.setup()

      await renderSidebarFilters()

      const fragrancesRadio = screen.getByRole('radio', { name: /fragrances/i })
      await user.click(fragrancesRadio)

      expect(mockReplace).toHaveBeenCalledTimes(1)

      // Verify the URL passed to router.replace
      const [targetUrl, navigationOptions] = mockReplace.mock.calls[0]
      expect(navigationOptions).toEqual({ scroll: false })

      const urlObj = new URL(targetUrl, 'https://example.com')
      expect(urlObj.pathname).toBe('/')
      expect(urlObj.searchParams.get('category')).toBe('fragrances')
      expect(urlObj.searchParams.get('page')).toBe('1')
      expect(urlObj.searchParams.has('query')).toBe(false)
    })
  })

  // --- 5. Layout & Children Rendering ---
  describe('Layout & Children Rendering', () => {
    it('renders heading, description, and children in the home layout', async () => {
      await renderSidebarFilters(
        <div data-testid="product-grid">Product Catalog Grid</div>
      )

      expect(screen.getByRole('heading', { name: /new arrivals/i })).toBeInTheDocument()
      expect(
        screen.getByText(/check out the latest release of basic tees/i)
      ).toBeInTheDocument()
      expect(screen.getByTestId('product-grid')).toBeInTheDocument()
    })
  })
})
