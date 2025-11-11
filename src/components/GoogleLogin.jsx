import { useState, useEffect } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'

export default function GoogleLogin({ onAuthSuccess, onAuthFailure, getUser }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Check for existing auth on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user')
    const storedToken = sessionStorage.getItem('accessToken')
    const tokenExpiry = sessionStorage.getItem('tokenExpiry')

    if (storedUser && storedToken && tokenExpiry) {
      const now = Date.now()
      if (now < parseInt(tokenExpiry)) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        onAuthSuccess?.(storedToken, userData)
        getUser?.(userData)
      } else {
        // Token expired, clear storage
        sessionStorage.removeItem('user')
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('tokenExpiry')
        sessionStorage.removeItem('lastSpreadsheetId')
        setUser(null)
      }
    }
  }, [onAuthSuccess])

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true)
      try {
        // Fetch user info
        const userInfoResponse = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        )

        const userData = {
          name: userInfoResponse.data.name,
          email: userInfoResponse.data.email,
          picture: userInfoResponse.data.picture,
        }

        // Calculate token expiry (Google tokens typically expire in 1 hour)
        const expiryTime = Date.now() + (tokenResponse.expires_in * 1000)

        // Store user info and token in sessionStorage (cleared on tab close)
        sessionStorage.setItem('user', JSON.stringify(userData))
        sessionStorage.setItem('accessToken', tokenResponse.access_token)
        sessionStorage.setItem('tokenExpiry', expiryTime.toString())

        setUser(userData)
        onAuthSuccess?.(tokenResponse.access_token, userData)
        getUser?.(userData)
      } catch (error) {
        console.error('Error fetching user info:', error)
        onAuthFailure?.(error)
      } finally {
        setIsLoading(false)
      }
    },
    onError: (error) => {
      console.error('Login failed:', error)
      onAuthFailure?.(error)
    },
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
  })

  const logout = () => {
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('tokenExpiry')
    setUser(null)
    window.location.reload()
  }

  // Return user data for parent component to handle display
  if (user) {
    return null // Profile menu will be handled by ProfileMenu component
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={() => login()}
        disabled={isLoading}
        className="flex items-center gap-3 px-6 py-3 bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-50 transition-all duration-200 font-medium border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </button>
      <p className="text-sm text-gray-600 text-center max-w-md">
        Sign in to access your Google Sheets and view your quotes
      </p>
    </div>
  )
}

