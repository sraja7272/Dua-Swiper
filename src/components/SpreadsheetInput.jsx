import { useState, useEffect } from 'react'
import { fetchSheetData } from '../utils/sheetsApi'
import SpreadsheetPicker from './SpreadsheetPicker'

export default function SpreadsheetInput({ accessToken, onDataLoaded, disableAutoLoad = false }) {
  const [isAutoLoading, setIsAutoLoading] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)

  // Automatically load last spreadsheet on mount if it exists
  useEffect(() => {
    // Don't auto-load if explicitly disabled (e.g., when user wants to change sheet)
    if (disableAutoLoad) {
      return
    }

    const loadLastSpreadsheet = async () => {
      const lastId = sessionStorage.getItem('lastSpreadsheetId')
      if (!lastId || !accessToken) {
        return
      }

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
      } catch (error) {
        // Clear the last ID if it fails to load
        sessionStorage.removeItem('lastSpreadsheetId')
        setIsAutoLoading(false)
        
        // If authentication expired, clear user session
        if (error.message && error.message.includes('Authentication expired')) {
          sessionStorage.removeItem('user')
          sessionStorage.removeItem('accessToken')
          sessionStorage.removeItem('tokenExpiry')
          window.location.reload()
        }
      } finally {
        // Animation state will be reset when component unmounts
      }
    }

    loadLastSpreadsheet()
  }, [accessToken, onDataLoaded, disableAutoLoad])

  const handleSpreadsheetSelected = async (spreadsheetId) => {
    try {
      const duas = await fetchSheetData(spreadsheetId, accessToken)
      
      // Save spreadsheet ID to sessionStorage for convenience (cleared on tab close)
      sessionStorage.setItem('lastSpreadsheetId', spreadsheetId)
      
      onDataLoaded?.(duas)
    } catch (err) {
      // If authentication expired, clear user session and reload
      if (err.message && err.message.includes('Authentication expired')) {
        sessionStorage.removeItem('user')
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('tokenExpiry')
        sessionStorage.removeItem('lastSpreadsheetId')
        window.location.reload()
        return
      }
      
      // Re-throw error so it can be caught and displayed in the UI by SpreadsheetPicker
      throw err
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
    <>
      <SpreadsheetPicker
        accessToken={accessToken}
        onSpreadsheetSelected={handleSpreadsheetSelected}
      />
    </>
  )
}

