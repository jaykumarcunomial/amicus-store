import { render, screen, fireEvent } from '@testing-library/react'

import ProductDetailClient from '@/app/components/ProductDetailClient'
import { ProductItem } from '@/app/context/CompareContext'

const mockAddToCart = jest.fn()
const mockAddToCompare = jest.fn()
const mockRemoveFromCompare = jest.fn()
let mockIsInCompare = jest.fn()
let mockIsAuthenticated = false

jest.mock('../app/context/CartContext', () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
  }),
}))

jest.mock('../app/context/CompareContext', () => ({
  useCompare: () => ({
    isInCompare: mockIsInCompare,
    addToCompare: mockAddToCompare,
    removeFromCompare: mockRemoveFromCompare,
  }),
}))

jest.mock('../app/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

const mockProduct: ProductItem = {
  id: 1,
  title: 'Ultra Smartphone Pro',
  brand: 'TechBrand',
  category: 'smartphones',
  price: 899.99,
  discountPercentage: 15.5,
  rating: 4.8,
  stock: 42,
  description: 'A cutting-edge smartphone with exceptional display and camera performance.',
  thumbnail: 'https://example.com/phone-thumb.jpg',
  images: [
    'https://example.com/phone-front.jpg',
    'https://example.com/phone-back.jpg',
    'https://example.com/phone-side.jpg',
  ],
  dimensions: {
    width: 7.5,
    height: 15.2,
    depth: 0.8,
  },
  weight: 0.18,
  sku: 'TECH-SP-001',
  tags: ['gadgets', 'tech', 'flagship'],
  shippingInformation: 'Free 2-day delivery',
  warrantyInformation: '2-Year Warranty',
  returnPolicy: '30-Day Return',
  reviews: [
    {
      reviewerName: 'Alice Smith',
      rating: 5,
      comment: 'Super fast and incredible screen quality!',
      date: '2026-01-15T10:00:00.000Z',
    },
    {
      reviewerName: 'Bob Jones',
      rating: 4,
      comment: 'Great battery life, slightly heavy.',
      date: '2026-02-01T12:30:00.000Z',
    },
  ],
}

describe('ProductDetailClient Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsInCompare.mockReturnValue(false)
    mockIsAuthenticated = false
  })

  describe('Product Details & Information Display', () => {
    it('renders basic product information correctly', () => {
      render(<ProductDetailClient initialProduct={mockProduct} />)

      // Title & Category & Brand
      expect(screen.getByRole('heading', { level: 1, name: 'Ultra Smartphone Pro' })).toBeInTheDocument()
      expect(screen.getAllByText('smartphones')).toHaveLength(2)
      expect(screen.getByText('TechBrand')).toBeInTheDocument()
      expect(screen.getByText(mockProduct.description!)).toBeInTheDocument()

      // Price & Stock & Discount
      expect(screen.getByText('$899.99')).toBeInTheDocument()
      expect(screen.getByText(/In Stock \(42 available\)/i)).toBeInTheDocument()
      expect(screen.getByText('-16% OFF')).toBeInTheDocument()

      // Ratings & Reviews count
      expect(screen.getByText('4.8')).toBeInTheDocument()
      expect(screen.getByText('2 reviews')).toBeInTheDocument()

      // Value props
      expect(screen.getByText('Free 2-day delivery')).toBeInTheDocument()
      expect(screen.getByText('2-Year Warranty')).toBeInTheDocument()
      expect(screen.getByText('30-Day Return')).toBeInTheDocument()
    })

    it('renders technical specifications and reviews correctly', () => {
      render(<ProductDetailClient initialProduct={mockProduct} />)

      // Technical Specifications
      expect(screen.getByText('7.5 x 15.2 x 0.8 cm')).toBeInTheDocument()
      expect(screen.getByText('0.18 kg')).toBeInTheDocument()
      expect(screen.getByText('TECH-SP-001')).toBeInTheDocument()
      expect(screen.getByText('gadgets, tech, flagship')).toBeInTheDocument()

      // Customer Reviews
      expect(screen.getByText('Customer Reviews (2)')).toBeInTheDocument()
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      expect(screen.getByText('"Super fast and incredible screen quality!"')).toBeInTheDocument()
      expect(screen.getByText('Bob Jones')).toBeInTheDocument()
      expect(screen.getByText('"Great battery life, slightly heavy."')).toBeInTheDocument()
    })

    it('handles fallback values for products without optional specifications and reviews', () => {
      const minimalProduct: ProductItem = {
        id: 99,
        title: 'Minimal Item',
        price: 25.0,
        thumbnail: 'https://example.com/minimal.jpg',
      }

      render(<ProductDetailClient initialProduct={minimalProduct} />)

      expect(screen.getByRole('heading', { level: 1, name: 'Minimal Item' })).toBeInTheDocument()
      expect(screen.getByText('$25.00')).toBeInTheDocument()
      expect(screen.getByText('Standard')).toBeInTheDocument() // fallback dimensions
      expect(screen.getByText('N/A')).toBeInTheDocument() // fallback weight
      expect(screen.getByText('SKU-99')).toBeInTheDocument() // fallback SKU
      expect(screen.getByText('general')).toBeInTheDocument() // fallback tags
      expect(screen.getByText('No reviews yet for this product.')).toBeInTheDocument()
    })
  })

  describe('Image Gallery Interactions', () => {
    it('displays the first image by default and updates when a thumbnail is clicked', () => {
      const { container } = render(<ProductDetailClient initialProduct={mockProduct} />)

      const mainImage = screen.getByRole('img', { name: 'Ultra Smartphone Pro' }) as HTMLImageElement
      expect(mainImage.src).toBe(mockProduct.images![0])

      // Find thumbnail buttons in the thumbnail container
      const thumbnailButtons = container.querySelectorAll('.overflow-x-auto button')
      expect(thumbnailButtons.length).toBe(mockProduct.images!.length)

      // Click second thumbnail
      fireEvent.click(thumbnailButtons[1])
      expect(mainImage.src).toBe(mockProduct.images![1])

      // Click third thumbnail
      fireEvent.click(thumbnailButtons[2])
      expect(mainImage.src).toBe(mockProduct.images![2])
    })

    it('falls back to thumbnail if images array is empty', () => {
      const productWithOnlyThumbnail: ProductItem = {
        id: 2,
        title: 'Single Image Product',
        price: 49.99,
        thumbnail: 'https://example.com/single.jpg',
        images: [],
      }

      render(<ProductDetailClient initialProduct={productWithOnlyThumbnail} />)

      const mainImage = screen.getByRole('img', { name: 'Single Image Product' }) as HTMLImageElement
      expect(mainImage.src).toBe('https://example.com/single.jpg')
    })
  })

  describe('Quantity Selector & Add to Cart', () => {
    it('increments and decrements quantity correctly, never going below 1', () => {
      render(<ProductDetailClient initialProduct={mockProduct} />)

      const decrementBtn = screen.getByRole('button', { name: '-' })
      const incrementBtn = screen.getByRole('button', { name: '+' })

      expect(screen.getByText('1')).toBeInTheDocument()

      // Cannot decrement below 1
      fireEvent.click(decrementBtn)
      expect(screen.getByText('1')).toBeInTheDocument()

      // Increment to 3
      fireEvent.click(incrementBtn)
      expect(screen.getByText('2')).toBeInTheDocument()
      fireEvent.click(incrementBtn)
      expect(screen.getByText('3')).toBeInTheDocument()

      // Decrement back to 2
      fireEvent.click(decrementBtn)
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('calls addToCart with product and selected quantity when Add to Cart is clicked', () => {
      render(<ProductDetailClient initialProduct={mockProduct} />)

      const incrementBtn = screen.getByRole('button', { name: '+' })
      fireEvent.click(incrementBtn)
      fireEvent.click(incrementBtn) // quantity is now 3

      const addToCartButton = screen.getByRole('button', { name: /Add to Cart/i })
      fireEvent.click(addToCartButton)

      expect(mockAddToCart).toHaveBeenCalledTimes(1)
      expect(mockAddToCart).toHaveBeenCalledWith(mockProduct, 3)
    })
  })

  describe('Compare Functionality', () => {
    it('calls addToCompare when item is not currently in compare list', () => {
      mockIsInCompare.mockReturnValue(false)

      render(<ProductDetailClient initialProduct={mockProduct} />)

      const compareButton = screen.getByRole('button', { name: /Compare/i })
      expect(compareButton).toHaveAttribute('title', 'Add to Compare')

      fireEvent.click(compareButton)

      expect(mockAddToCompare).toHaveBeenCalledTimes(1)
      expect(mockAddToCompare).toHaveBeenCalledWith(mockProduct)
      expect(mockRemoveFromCompare).not.toHaveBeenCalled()
    })

    it('calls removeFromCompare when item is already in compare list', () => {
      mockIsInCompare.mockReturnValue(true)

      render(<ProductDetailClient initialProduct={mockProduct} />)

      const compareButton = screen.getByRole('button', { name: /Compared/i })
      expect(compareButton).toHaveAttribute('title', 'Remove from Compare')

      fireEvent.click(compareButton)

      expect(mockRemoveFromCompare).toHaveBeenCalledTimes(1)
      expect(mockRemoveFromCompare).toHaveBeenCalledWith(mockProduct.id)
      expect(mockAddToCompare).not.toHaveBeenCalled()
    })
  })

  describe('Authentication & Admin Modals (Edit / Delete)', () => {
    it('does not display Edit and Delete buttons when user is not authenticated', () => {
      mockIsAuthenticated = false

      render(<ProductDetailClient initialProduct={mockProduct} />)

      expect(screen.queryByRole('button', { name: /Edit Product/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Delete/i })).not.toBeInTheDocument()
    })

    it('displays Edit and Delete buttons when user is authenticated', () => {
      mockIsAuthenticated = true

      render(<ProductDetailClient initialProduct={mockProduct} />)

      expect(screen.getByRole('button', { name: /Edit Product/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument()
    })

    it('opens EditProductModal when Edit Product button is clicked', () => {
      mockIsAuthenticated = true

      render(<ProductDetailClient initialProduct={mockProduct} />)

      const editBtn = screen.getByRole('button', { name: /Edit Product/i })
      fireEvent.click(editBtn)

      expect(screen.getByText(`Edit Product #${mockProduct.id}`)).toBeInTheDocument()
      expect(screen.getByDisplayValue(mockProduct.title)).toBeInTheDocument()
    })

    it('opens DeleteProductDialog when Delete button is clicked', () => {
      mockIsAuthenticated = true

      render(<ProductDetailClient initialProduct={mockProduct} />)

      const deleteBtn = screen.getByRole('button', { name: /Delete/i })
      fireEvent.click(deleteBtn)

      expect(screen.getByText(`Delete Product #${mockProduct.id}?`)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Confirm Delete/i })).toBeInTheDocument()
    })
  })
})
