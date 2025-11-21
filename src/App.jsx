import { useState, useEffect } from 'react'
import GoogleLogin from './components/GoogleLogin'
import ProfileMenu from './components/ProfileMenu'
import SpreadsheetInput from './components/SpreadsheetInput'
import CardDeck from './components/CardDeck'
import DuasPanel from './components/DuasPanel'

function App() {
  const [accessToken, setAccessToken] = useState(null)
  const [user, setUser] = useState(null)
  const [duas, setDuas] = useState([])
  const [showSpreadsheetInput, setShowSpreadsheetInput] = useState(false)
  const [isDuasPanelOpen, setIsDuasPanelOpen] = useState(false)

  // Helper function to get user-specific localStorage keys
  const getUserStorageKey = (key, userEmail) => {
    return userEmail ? `${key}_${userEmail}` : key
  }

  // Helper function to clear old user's spreadsheet data
  const clearOldUserSpreadsheetData = (currentUserEmail) => {
    // Get all localStorage keys
    const keys = Object.keys(localStorage)
    // Find keys that match the pattern but belong to different users
    keys.forEach(key => {
      if (key.startsWith('lastSpreadsheetId_') || 
          key.startsWith('lastNameColumnIndex_') || 
          key.startsWith('lastDuasColumnIndex_')) {
        const keyUserEmail = key.split('_').slice(1).join('_') // Get email part after first underscore
        if (keyUserEmail && keyUserEmail !== currentUserEmail) {
          localStorage.removeItem(key)
        }
      }
    })
  }

  // Check for existing session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken')
    const storedUser = localStorage.getItem('user')
    const tokenExpiry = localStorage.getItem('tokenExpiry')

    if (storedToken && storedUser && tokenExpiry) {
      const now = Date.now()
      if (now < parseInt(tokenExpiry)) {
        const userData = JSON.parse(storedUser)
        setAccessToken(storedToken)
        setUser(userData)
        // Clear any old user's spreadsheet data
        clearOldUserSpreadsheetData(userData.email)
      } else {
        // Token expired, clear storage and user state (but keep spreadsheet data for when they log back in)
        localStorage.removeItem('user')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('tokenExpiry')
        setUser(null)
        setAccessToken(null)
        setDuas([])
      }
    }
  }, [])

  const handleAuthSuccess = (token, userData) => {
    // Clear old user's spreadsheet data if switching users
    if (user && user.email !== userData.email) {
      clearOldUserSpreadsheetData(userData.email)
    }
    setAccessToken(token)
    setUser(userData)
  }

  const handleAuthFailure = (error) => {
    console.error('Authentication failed:', error)
    alert('Authentication failed. Please try again.')
  }

  const handleGetUser = (userData) => {
    setUser(userData)
  }

  const handleSignOut = () => {
    // Clear everything when user explicitly signs out
    const appKeys = ['user', 'accessToken', 'tokenExpiry']
    appKeys.forEach(key => localStorage.removeItem(key))
    // Clear current user's spreadsheet data
    if (user?.email) {
      localStorage.removeItem(getUserStorageKey('lastSpreadsheetId', user.email))
      localStorage.removeItem(getUserStorageKey('lastNameColumnIndex', user.email))
      localStorage.removeItem(getUserStorageKey('lastDuasColumnIndex', user.email))
    }
    setUser(null)
    setAccessToken(null)
    setDuas([])
    window.location.reload()
  }

  // Shuffle array function (Fisher-Yates algorithm)
  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const handleDataLoaded = (loadedDuas) => {
    // Randomize the duas array before setting
    const randomizedDuas = shuffleArray(loadedDuas)
    setDuas(randomizedDuas)
    setShowSpreadsheetInput(false)
  }

  const handleChangeSpreadsheet = () => {
    // Clear the last spreadsheet ID and column indices for current user
    if (user?.email) {
      localStorage.removeItem(getUserStorageKey('lastSpreadsheetId', user.email))
      localStorage.removeItem(getUserStorageKey('lastNameColumnIndex', user.email))
      localStorage.removeItem(getUserStorageKey('lastDuasColumnIndex', user.email))
    }
    setShowSpreadsheetInput(true)
    setDuas([])
  }

  const handleBackToCards = () => {
    setShowSpreadsheetInput(false)
  }

  // Function to reload duas from the spreadsheet
  const handleReloadDuas = async () => {
    if (!user?.email || !accessToken) {
      return { success: false, error: 'No user or access token' }
    }

    const getUserStorageKey = (key) => {
      return user?.email ? `${key}_${user.email}` : key
    }

    const lastId = localStorage.getItem(getUserStorageKey('lastSpreadsheetId'))
    if (!lastId) {
      return { success: false, error: 'No spreadsheet ID found' }
    }

    // Check if we have saved column indices
    const savedNameColumnIndex = localStorage.getItem(getUserStorageKey('lastNameColumnIndex'))
    const savedDuasColumnIndex = localStorage.getItem(getUserStorageKey('lastDuasColumnIndex'))
    const nameColumnIndex = savedNameColumnIndex !== null ? parseInt(savedNameColumnIndex) : null
    const duasColumnIndex = savedDuasColumnIndex !== null ? parseInt(savedDuasColumnIndex) : null

    try {
      const { fetchSheetData } = await import('./utils/sheetsApi')
      const loadedDuas = await fetchSheetData(lastId, accessToken, nameColumnIndex, duasColumnIndex)
      const randomizedDuas = shuffleArray(loadedDuas)
      setDuas(randomizedDuas)
      return { success: true, duas: randomizedDuas }
    } catch (error) {
      // Check if it's a network error (offline)
      const isOffline = !navigator.onLine || (error.message && (
        error.message.includes('Network Error') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('network')
      ))

      // Check if it's an authentication error
      const isAuthError = error.message && error.message.includes('Authentication expired')

      return {
        success: false,
        error: isOffline ? 'offline' : isAuthError ? 'auth_expired' : error.message || 'Unknown error'
      }
    }
  }

  // Function to handle going back to login
  const handleBackToLogin = () => {
    setUser(null)
    setAccessToken(null)
    setDuas([])
    setShowSpreadsheetInput(false)
  }

  // Check if we need environment setup
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const needsSetup = !clientId

  if (needsSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <svg
              className="w-8 h-8 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900">
              Setup Required
            </h2>
          </div>
          <div className="space-y-4 text-gray-700">
            <p>
              This app requires a Google Cloud OAuth Client ID to function.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">To set up:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Create a Google Cloud project</li>
                <li>Enable Google Sheets API and Google Picker API</li>
                <li>Create OAuth 2.0 credentials (Web application)</li>
                <li>Add authorized JavaScript origins</li>
                <li>
                  Create a <code className="bg-gray-200 px-2 py-1 rounded">.env</code> file
                </li>
                <li>
                  Add: <code className="bg-gray-200 px-2 py-1 rounded">VITE_GOOGLE_CLIENT_ID=your_client_id</code>
                </li>
                <li>Restart the development server</li>
              </ol>
            </div>
            <p className="text-sm text-gray-600">
              See the README.md file for detailed instructions.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Check if we're on the swiping page
  const isSwipingPage = user && duas.length > 0 && !showSpreadsheetInput

  return (
    <div className="relative flex min-h-dvh">
      {/* Backdrop overlay */}
      {isDuasPanelOpen && (
        <div
          className="fixed inset-0 h-dvh bg-black/20 z-30"
          onClick={() => setIsDuasPanelOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Duas Panel */}
      <DuasPanel isOpen={isDuasPanelOpen} onClose={() => setIsDuasPanelOpen(false)} />

      {/* Main Content Container */}
      <div className="flex-1 w-full min-h-dvh">
        <div className="py-8 px-4 min-h-dvh">
          {/* Toggle Button - Top Left */}
          <button
            onClick={() => setIsDuasPanelOpen(!isDuasPanelOpen)}
            className={`fixed top-4 left-4 z-50 p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-all duration-300 border border-gray-200 ${
              isDuasPanelOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
            }`}
            aria-label="Toggle duas panel"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="max-w-7xl mx-auto">
        {/* Header - only show when not on swiping page */}
        {!isSwipingPage && (
          <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Duas Swiper
            </h1>
            <p className="text-gray-600">
              Swipe through your favorite duas from Google Sheets
            </p>
          </header>
        )}

        {/* Auth Section */}
        {!user && (
          <div className="flex justify-center mb-8">
            <GoogleLogin
              onAuthSuccess={handleAuthSuccess}
              onAuthFailure={handleAuthFailure}
              getUser={handleGetUser}
            />
          </div>
        )}

        {/* User is authenticated */}
        {user && (
          <>
            {/* Main content */}
            {showSpreadsheetInput || duas.length === 0 ? (
              <>
                {/* Profile Menu at top right */}
                <div className="fixed top-4 right-4 z-50">
                  <ProfileMenu
                    user={user}
                    onSignOut={handleSignOut}
                    onChangeSpreadsheet={handleChangeSpreadsheet}
                  />
                </div>
              <div>
                <SpreadsheetInput
                  accessToken={accessToken}
                  user={user}
                  onDataLoaded={handleDataLoaded}
                  disableAutoLoad={showSpreadsheetInput}
                />
                {duas.length > 0 && (
                  <div className="text-center mt-6">
                    <button
                      onClick={handleBackToCards}
                      className="btn-secondary"
                    >
                      Back to Cards
                    </button>
                  </div>
                )}
              </div>
              </>
            ) : (
              <div className="fixed inset-0 h-dvh flex flex-col">
                {/* Profile Menu at top right */}
                <div className="absolute top-4 right-4 z-50">
                  <ProfileMenu
                    user={user}
                    onSignOut={handleSignOut}
                    onChangeSpreadsheet={handleChangeSpreadsheet}
                  />
                </div>
                
                {/* Full screen card deck */}
                <CardDeck 
                  duas={duas} 
                  accessToken={accessToken}
                  user={user}
                  onReloadDuas={handleReloadDuas}
                  onBackToLogin={handleBackToLogin}
                />
              </div>
            )}
          </>
        )}

        {/* Footer - only show when not on swiping page */}
        {!isSwipingPage && (
          <footer className="mt-16 text-center text-sm text-gray-500">
            <p>
              Built with React, Tailwind CSS, and Google Sheets API
            </p>
            <p className="mt-2">
              Your data stays in your browser - we don't store anything
            </p>
          </footer>
        )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
