import { useState, useEffect } from 'react'
import GoogleLogin from './components/GoogleLogin'
import ProfileMenu from './components/ProfileMenu'
import SpreadsheetInput from './components/SpreadsheetInput'
import CardDeck from './components/CardDeck'

function App() {
  const [accessToken, setAccessToken] = useState(null)
  const [user, setUser] = useState(null)
  const [duas, setDuas] = useState([])
  const [spreadsheetId, setSpreadsheetId] = useState(null)
  const [showSpreadsheetInput, setShowSpreadsheetInput] = useState(false)

  // Check for existing session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken')
    const storedUser = localStorage.getItem('user')
    const tokenExpiry = localStorage.getItem('tokenExpiry')

    if (storedToken && storedUser && tokenExpiry) {
      const now = Date.now()
      if (now < parseInt(tokenExpiry)) {
        setAccessToken(storedToken)
        setUser(JSON.parse(storedUser))
      } else {
        // Token expired, clear storage
        localStorage.removeItem('user')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('tokenExpiry')
      }
    }
  }, [])

  const handleAuthSuccess = (token, userData) => {
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
    // Clear all localStorage
    localStorage.clear()
    setUser(null)
    setAccessToken(null)
    setDuas([])
    setSpreadsheetId(null)
    window.location.reload()
  }

  const handleDataLoaded = (loadedDuas, sheetId) => {
    setDuas(loadedDuas)
    setSpreadsheetId(sheetId)
    setShowSpreadsheetInput(false)
  }

  const handleChangeSpreadsheet = () => {
    // Clear the last spreadsheet ID so it doesn't auto-load on refresh
    localStorage.removeItem('lastSpreadsheetId')
    setShowSpreadsheetInput(true)
    setDuas([])
  }

  const handleBackToCards = () => {
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
                <li>Enable Google Sheets API</li>
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
    <div className="min-h-screen py-8 px-4">
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
              <div className="fixed inset-0 flex flex-col">
                {/* Profile Menu at top right */}
                <div className="absolute top-4 right-4 z-50">
                  <ProfileMenu
                    user={user}
                    onSignOut={handleSignOut}
                    onChangeSpreadsheet={handleChangeSpreadsheet}
                  />
                </div>
                
                {/* Full screen card deck */}
                <CardDeck duas={duas} />
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
  )
}

export default App
