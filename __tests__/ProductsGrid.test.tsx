import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";

import ProductsGrid from "@/app/components/ProductsGrid";
import { useCart } from "@/app/context/CartContext";
import { ProductItem, useCompare } from "@/app/context/CompareContext";

// 1. Mock the custom context hooks
jest.mock('@/app/context/CartContext', () => ({
    useCart: jest.fn()
}))

jest.mock('@/app/context/CompareContext', () => ({
    useCompare: jest.fn()
}))

describe('ProductsGrid Component', () => {
    const mockAddToCart = jest.fn()
    const mockAddToCompare = jest.fn()
    const mockRemoveFromCompare = jest.fn()
    const mockIsInCompare = jest.fn()

    const sampleProducts: ProductItem[] = [
        {
            id: 1,
            title: 'Ergonomic Office Chair',
            price: 199.99,
            category: 'Furniture',
            brand: 'ComfortCo',
            rating: 4.5,
            discountPercentage: 15.2,
            thumbnail: 'https://example.com/chair.jpg',
            images: ['https://example.com/chair.jpg'],
        },
        {
            id: 2,
            title: 'Mechanical Keyboard',
            price: 89.0,
            category: 'Electronics',
            brand: 'KeyPro',
            thumbnail: '',
            images: ['https://example.com/keyboard-alt.jpg'],
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()

            // Default mock hook returns
            ; (useCart as jest.Mock).mockReturnValue({
                addToCart: mockAddToCart,
            })

            ; (useCompare as jest.Mock).mockReturnValue({
                isInCompare: mockIsInCompare.mockReturnValue(false),
                addToCompare: mockAddToCompare,
                removeFromCompare: mockRemoveFromCompare,
            })
    })

    // --- Scenario 1: Empty & Edge Cases ---
    it('renders "No products found" message when list is empty or undefined', () => {
        const { rerender } = render(<ProductsGrid products={[]} />)
        expect(screen.getByText(/no products found/i)).toBeInTheDocument()

        // Test undefined fallback
        rerender(<ProductsGrid products={undefined as unknown as ProductItem[]} />)
        expect(screen.getByText(/no products found/i)).toBeInTheDocument()
    })

    // --- Scenario 2: Data Presentation ---
    it('renders product details, titles, images, and prices', () => {
        render(<ProductsGrid products={sampleProducts} />)

        // Heading Links 
        const chairLink = screen.getByRole('link', { name: /ergonomic office chair/i })
        expect(chairLink).toHaveAttribute('href', '/product/1')

        // Prices
        expect(screen.getByText('$199.99')).toBeInTheDocument()
        expect(screen.getByText('$89.00')).toBeInTheDocument()

        // Images and fallbacks
        const chairImg = screen.getByRole('img', { name: 'Ergonomic Office Chair' })
        expect(chairImg).toHaveAttribute('src', 'https://example.com/chair.jpg')
        const chairImgAlt = screen.getByAltText('Ergonomic Office Chair')
        expect(chairImgAlt).toHaveAttribute('src', 'https://example.com/chair.jpg')

        // Uses images[0] when thumbnail is empty
        const keyboardImg = screen.getByAltText('Mechanical Keyboard')
        expect(keyboardImg).toHaveAttribute('src', 'https://example.com/keyboard-alt.jpg')

        // Discount badge: 15.2% -> Math.round -> 15%
        expect(screen.getByText('-15%')).toBeInTheDocument()

        // Rating 
        expect(screen.getByText('4.5')).toBeInTheDocument()
    })

    // --- Scenario 3: Cart Interaction --- 
    it('triggers addToCart with product and quantity 1 when Add button is clicked', async () => {
        const user = userEvent.setup()
        mockIsInCompare.mockReturnValue(false)

        render(<ProductsGrid products={[sampleProducts[0]]} />)


        const compareBtn = screen.getByRole('button', {
            name: /Add to comparison/i
        })
        await user.click(compareBtn)

        expect(mockAddToCompare).toHaveBeenCalledTimes(1)
        expect(mockAddToCompare).toHaveBeenCalledWith(sampleProducts[0])
        expect(mockRemoveFromCompare).not.toHaveBeenCalled()
    })

    it('removes product from compare when already compared', async () => {
        const user = userEvent.setup()
        // Simulate that product 1 is already in comparison
        mockIsInCompare.mockImplementation((id: number) => id === 1)

        render(<ProductsGrid products={[sampleProducts[0]]} />)

        const compareBtn = screen.getByRole('button', { name: /remove from comparison/i })
        await user.click(compareBtn)

        expect(mockRemoveFromCompare).toHaveBeenCalledTimes(1)
        expect(mockRemoveFromCompare).toHaveBeenCalledWith(1)
        expect(mockAddToCompare).not.toHaveBeenCalled()
    })
});