import { render, screen, fireEvent, act } from '@testing-library/react'

import SearchBox from '@/app/components/SearchBox'

const mockReplace = jest.fn()
let mockSearchParams = new URLSearchParams()
let mockPathname = '/'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}))

describe('SearchBox Component', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockReplace.mockClear()
    mockSearchParams = new URLSearchParams()
    mockPathname = '/'
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
  })

  it('renders with default placeholder', () => {
    render(<SearchBox />)
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    render(<SearchBox placeholder="Search products..." />)
    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument()
  })

  it('initializes input value from URL query parameter', () => {
    mockSearchParams = new URLSearchParams('query=phone')
    render(<SearchBox />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('phone')
  })

  it('updates input immediately and debounces router navigation by 300ms', () => {
    render(<SearchBox />)
    const input = screen.getByRole('textbox') as HTMLInputElement

    fireEvent.change(input, { target: { value: 'laptop' } })
    expect(input.value).toBe('laptop')

    // Before 300ms: router.replace should NOT be called yet
    expect(mockReplace).not.toHaveBeenCalled()

    // Fast-forward past debounce time
    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(mockReplace).toHaveBeenCalledTimes(1)
    expect(mockReplace).toHaveBeenCalledWith('/?query=laptop', { scroll: false })
  })

  it('removes category parameter when a new query is searched', () => {
    mockSearchParams = new URLSearchParams('category=laptops')
    render(<SearchBox />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'macbook' } })

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(mockReplace).toHaveBeenCalledWith('/?query=macbook', { scroll: false })
  })

  it('deletes query parameter when search input is cleared', () => {
    mockSearchParams = new URLSearchParams('query=shoes')
    render(<SearchBox />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '' } })

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(mockReplace).toHaveBeenCalledWith('/?', { scroll: false })
  })

  it('syncs input value when URL query search parameter changes externally', () => {
    mockSearchParams = new URLSearchParams('query=initial')
    const { rerender } = render(<SearchBox />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('initial')

    // Simulate URL query parameter change externally
    mockSearchParams = new URLSearchParams('query=updated')
    rerender(<SearchBox />)

    expect(input.value).toBe('updated')
  })
})
