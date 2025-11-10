import { useState, useEffect } from 'react'
import { parseSpreadsheetUrl } from '../utils/parseSpreadsheetUrl'
import { fetchSheetData } from '../utils/sheetsApi'

export default function SpreadsheetInput({ accessToken, onDataLoaded, disableAutoLoad = false }) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAutoLoading, setIsAutoLoading] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [error, setError] = useState('')

  // Automatically load last spreadsheet on mount if it exists
  useEffect(() => {
    // Don't auto-load if explicitly disabled (e.g., when user wants to change sheet)
    if (disableAutoLoad) {
      return
    }

    const loadLastSpreadsheet = async () => {
      const lastId = localStorage.getItem('lastSpreadsheetId')
      if (!lastId || !accessToken) {
        return
      }

      setError('')
      setInput(lastId)
      setIsAutoLoading(true)
      setShowAnimation(false)

      const startTime = Date.now()
      const minDisplayTime = 2000 // 2 seconds

      try {
        const duas = await fetchSheetData(lastId, accessToken)
        
        // Ensure minimum display time
        const elapsed = Date.now() - startTime
        const remainingTime = Math.max(0, minDisplayTime - elapsed)
        
        await new Promise(resolve => setTimeout(resolve, remainingTime))
        
        // Show animation before completing
        setShowAnimation(true)
        
        // Wait a bit for animation to be visible
        await new Promise(resolve => setTimeout(resolve, 500))
        
        onDataLoaded?.(duas)
      } catch (err) {
        setError(err.message || 'Failed to load spreadsheet')
        // Clear the last ID if it fails to load
        localStorage.removeItem('lastSpreadsheetId')
        setIsAutoLoading(false)
      } finally {
        // Animation state will be reset when component unmounts
      }
    }

    loadLastSpreadsheet()
  }, [accessToken, onDataLoaded, disableAutoLoad])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!input.trim()) {
      setError('Please enter a spreadsheet URL or ID')
      return
    }

    const spreadsheetId = parseSpreadsheetUrl(input)

    if (!spreadsheetId) {
      setError(
        'Invalid spreadsheet URL or ID. Please check and try again.'
      )
      return
    }

    setIsLoading(true)

    try {
      const duas = await fetchSheetData(spreadsheetId, accessToken)
      
      // Save spreadsheet ID to localStorage for convenience
      localStorage.setItem('lastSpreadsheetId', spreadsheetId)
      
          onDataLoaded?.(duas)
    } catch (err) {
      setError(err.message || 'Failed to load spreadsheet')
    } finally {
      setIsLoading(false)
    }
  }


  // Show loading screen when auto-loading
  if (isAutoLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center px-4 max-w-md">
          {showAnimation ? (
            <div className="space-y-6">
              <div className="flex justify-center">
                <svg
                  className="w-24 h-24 text-green-500 animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-2xl md:text-3xl text-gray-800 leading-relaxed" style={{ fontFamily: '"Playfair Display", "Cormorant Garamond", "EB Garamond", Georgia, serif', fontStyle: 'italic', letterSpacing: '0.05em' }}>
                All set!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
              </div>
              <p className="text-2xl md:text-3xl text-gray-800 leading-relaxed" style={{ fontFamily: '"Playfair Display", "Cormorant Garamond", "EB Garamond", Georgia, serif', fontStyle: 'italic', letterSpacing: '0.05em' }}>
                Give us a second to load your Duas
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Link Your Spreadsheet
        </h2>
        <p className="text-gray-600 mb-6">
          Enter your Google Sheets URL or ID. Your spreadsheet should have
          columns named "Name" and "Duas".
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="input-field"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex-1"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                'Load Spreadsheet'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Setup Instructions:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Create a Google Spreadsheet with columns "Name" and "Duas"</li>
            <li>Make sure you have access to the spreadsheet (own it or it's shared with you)</li>
            <li>Copy the spreadsheet URL from your browser</li>
            <li>Paste it above and click "Load Spreadsheet"</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

