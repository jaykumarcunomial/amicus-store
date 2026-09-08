import { useState, useEffect } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AuthProvider } from '@/app/context/AuthContext'
import ProfilePage from '@/app/profile/page'

let globalNavigate: (href: string) => void = () => { }

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: (url: string) => globalNavigate(url),
    replace: (url: string) => globalNavigate(url),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/profile',
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

// Mock auth actions
jest.mock('@/app/actions/auth', () => {
  const user = {
    id: 1,
    username: 'emilys',
    email: 'emily.johnson@x.dummyjson.com',
    firstName: 'Emily',
    lastName: 'Johnson',
    gender: 'female',
    role: 'admin',
    image: 'https://dummyjson.com/icon/emilys/128',
    accessToken: 'mock-access-token-12345',
    refreshToken: 'mock-refresh-token-67890',
  }

  return {
    loginUser: jest.fn(),
    getAuthUser: jest.fn().mockResolvedValue({ success: true, data: user }),
    refreshAccessToken: jest.fn().mockResolvedValue({
      success: true,
      data: { accessToken: 'new-refreshed-token', refreshToken: 'new-refresh' },
    }),
  }
})

function ProfileTestHarness() {
  const [currentRoute, setCurrentRoute] = useState('/profile')

  useEffect(() => {
    globalNavigate = (href: string) => {
      setCurrentRoute(href)
    }
  }, [])

  return (
    <AuthProvider>
      {currentRoute === '/profile' ? (
        <ProfilePage />
      ) : (
        <div data-testid="login-screen">
          <h1>Login Screen</h1>
        </div>
      )}
    </AuthProvider>
  )
}

describe('End-to-End Test: User Profile, Token Session, and Sign Out Flow', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('blocks unauthenticated guests from viewing profile and provides link to sign in', async () => {
    render(<ProfileTestHarness />)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Authentication Required/i })
      ).toBeInTheDocument()
    })

    expect(
      screen.getByText(/You need to be signed in to view your profile and token inspector\./i)
    ).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /Go to Sign In/i })).toHaveAttribute(
      'href',
      '/login?redirect=/profile'
    )
  })

  it('displays authenticated profile, allows manual token refresh, verifies /auth/me, and executes sign out', async () => {
    const user = userEvent.setup()

    // Pre-seed localStorage before mounting
    localStorage.setItem('dummyjson_access_token', 'valid-token')
    localStorage.setItem('dummyjson_refresh_token', 'valid-refresh')
    localStorage.setItem(
      'dummyjson_user',
      JSON.stringify({
        id: 1,
        username: 'emilys',
        email: 'emily.johnson@x.dummyjson.com',
        firstName: 'Emily',
        lastName: 'Johnson',
        gender: 'female',
        role: 'admin',
        image: 'https://dummyjson.com/icon/emilys/128',
      })
    )

    render(<ProfileTestHarness />)

    // 1. Verify User Profile Data is Rendered
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Emily Johnson' })
      ).toBeInTheDocument()
    })

    expect(screen.getByText('@emilys')).toBeInTheDocument()
    expect(screen.getByText('emily.johnson@x.dummyjson.com')).toBeInTheDocument()
    expect(screen.getAllByText('admin').length).toBeGreaterThanOrEqual(1)

    // 2. Test Token Refresh Action
    const refreshBtn = screen.getByRole('button', { name: /Refresh Access Token/i })
    await user.click(refreshBtn)

    await waitFor(() => {
      expect(
        screen.getByText(/Successfully refreshed access token via POST \/auth\/refresh!/i)
      ).toBeInTheDocument()
    })

    // 3. Test Verify /auth/me Action
    const verifyMeBtn = screen.getByRole('button', { name: /Call \/auth\/me/i })
    await user.click(verifyMeBtn)

    await waitFor(() => {
      expect(screen.getByText(/"success": true/i)).toBeInTheDocument()
    })

    // 4. Test Sign Out Action
    const signOutBtn = screen.getByRole('button', { name: /Sign Out/i })
    await user.click(signOutBtn)

    // Session is wiped from localStorage
    expect(localStorage.getItem('dummyjson_access_token')).toBeNull()
    expect(localStorage.getItem('dummyjson_user')).toBeNull()

    // Redirected to /login
    await waitFor(() => {
      expect(screen.getByTestId('login-screen')).toBeInTheDocument()
    })
  })
})
