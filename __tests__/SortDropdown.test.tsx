import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import SortDropdown from '@/app/components/SortDropdown'

const mockReplace = jest.fn()
let mockPathname = '/catalog'
let mockSearchParams = new URLSearchParams()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}))

describe('SortDropdown Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPathname = '/catalog'
    mockSearchParams = new URLSearchParams()
  })

  it('renders with default sort selection when no params are present', () => {
    render(<SortDropdown />)

    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select).toBeInTheDocument()
    expect(select.value).toBe('')
  })

  it('reflects current sort and order from search parameters', () => {
    mockSearchParams = new URLSearchParams('sortBy=price&order=asc')
    render(<SortDropdown />)

    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('price-asc')
  })

  it('updates URL search parameters and resets page to 1 on selection change', async () => {
    const user = userEvent.setup()
    mockSearchParams = new URLSearchParams('page=3&category=electronics')
    render(<SortDropdown />)

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'price-desc')

    expect(mockReplace).toHaveBeenCalledWith(
      '/catalog?page=1&category=electronics&sortBy=price&order=desc',
      { scroll: false }
    )
  })

  it('clears sortBy and order when selecting default/featured', async () => {
    const user = userEvent.setup()
    mockSearchParams = new URLSearchParams('sortBy=rating&order=desc&page=2')
    render(<SortDropdown />)

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, '')

    expect(mockReplace).toHaveBeenCalledWith(
      '/catalog?page=1',
      { scroll: false }
    )
  })
})
