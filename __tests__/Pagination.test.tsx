import { render, screen, fireEvent } from '@testing-library/react'

import Pagination from '@/app/components/Pagination'

const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => '/products',
  useSearchParams: () => new URLSearchParams('page=2'),
}))

describe('Pagination Component', () => {
  beforeEach(() => {
    mockReplace.mockClear()
  })

  it('renders nothing when totalPages is 1 or less', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} totalItems={10} limit={10} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders pagination details correctly', () => {
    render(
      <Pagination currentPage={2} totalPages={5} totalItems={50} limit={10} />
    )

    expect(screen.getByText(/Showing/i)).toBeInTheDocument()
    expect(screen.getByText('11')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('navigates when page button or next button is clicked', () => {
    render(
      <Pagination currentPage={2} totalPages={5} totalItems={50} limit={10} />
    )

    const nextButton = screen.getByRole('button', { name: /Next/i })
    fireEvent.click(nextButton)

    expect(mockReplace).toHaveBeenCalledWith('/products?page=3', { scroll: true })
  })

  it('disables previous button on first page', () => {
    render(
      <Pagination currentPage={1} totalPages={5} totalItems={50} limit={10} />
    )

    const prevButton = screen.getByRole('button', { name: /Prev/i })
    expect(prevButton).toBeDisabled()
  })
})
