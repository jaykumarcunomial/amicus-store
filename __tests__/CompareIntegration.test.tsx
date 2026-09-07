import { render, screen, fireEvent } from '@testing-library/react'

import { CompareProvider, ProductItem } from '@/app/context/CompareContext'
import CompareFloatingBar from '@/app/components/CompareFloatingBar'
import ProductsGrid from '@/app/components/ProductsGrid'

// Mock useCart since ProductsGrid also imports CartContext
jest.mock('@/app/context/CartContext', () => ({
  useCart: () => ({
    addToCart: jest.fn(),
  }),
}))

const mockProducts: ProductItem[] = [
  {
    id: 1,
    title: 'Wireless Headphones',
    price: 99.99,
    thumbnail: 'https://example.com/headphones.jpg',
    category: 'electronics',
  },
  {
    id: 2,
    title: 'Smart Watch',
    price: 199.99,
    thumbnail: 'https://example.com/watch.jpg',
    category: 'electronics',
  },
]

describe('Compare Feature Integration (CompareProvider + ProductsGrid + CompareFloatingBar)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds products to compare from ProductsGrid and reflects them in CompareFloatingBar', () => {
    render(
      <CompareProvider>
        <div>
          <ProductsGrid products={mockProducts} />
          <CompareFloatingBar />
        </div>
      </CompareProvider>
    )

    // 1. Initially, CompareFloatingBar is hidden because no products are in compare list
    expect(screen.queryByText(/Compare Products/i)).not.toBeInTheDocument()

    // 2. Find compare buttons on product cards (title is "Add to comparison")
    const compareButtons = screen.getAllByTitle('Add to comparison')
    expect(compareButtons).toHaveLength(2)

    // Click compare button on the first product
    fireEvent.click(compareButtons[0])

    // 3. CompareFloatingBar should now appear in the DOM
    expect(screen.getByText('Compare Products (1/3)')).toBeInTheDocument()
    expect(screen.getByText('Select at least 2 products to compare')).toBeInTheDocument()

    // 4. Click compare button on the second product
    fireEvent.click(compareButtons[1])

    // Floating bar updates status and shows 2 items
    expect(screen.getByText('Compare Products (2/3)')).toBeInTheDocument()
    expect(screen.getByText('Ready to compare side-by-side')).toBeInTheDocument()

    // 5. Remove first product using the remove button inside the floating bar chip
    const removeButtons = screen.getAllByTitle('Remove')
    fireEvent.click(removeButtons[0])

    // Count updates to (1/3)
    expect(screen.getByText('Compare Products (1/3)')).toBeInTheDocument()

    // 6. Click 'Clear' button in CompareFloatingBar
    const clearButton = screen.getByRole('button', { name: /Clear/i })
    fireEvent.click(clearButton)

    // Floating bar should disappear again
    expect(screen.queryByText(/Compare Products/i)).not.toBeInTheDocument()
  })
})
