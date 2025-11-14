import { useState, useEffect } from 'react'

export default function SpreadsheetPicker({ accessToken, onSpreadsheetSelected, defaultSearchQuery = 'dua' }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [pickerLoaded, setPickerLoaded] = useState(false)

  // Load Google Picker API
  useEffect(() => {
    if (!window.gapi || !window.google) {
      // Wait for scripts to load
      const checkGapi = setInterval(() => {
        if (window.gapi && window.google) {
          clearInterval(checkGapi)
          loadPicker()
        }
      }, 100)

      return () => clearInterval(checkGapi)
    } else {
      loadPicker()
    }
  }, [])

  const loadPicker = () => {
    if (window.gapi && window.gapi.load) {
      window.gapi.load('picker', () => {
        setPickerLoaded(true)
      })
    }
  }

  const createPicker = () => {
    if (!window.google || !window.google.picker) {
      setError('Google Picker API not loaded. Please refresh the page.')
      return
    }

    if (!accessToken) {
      setError('Please sign in first.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Create a DocsView with a prefilled search query
      const docsView = new window.google.picker.DocsView(window.google.picker.ViewId.SPREADSHEETS)
        .setQuery(defaultSearchQuery)
        .setMimeTypes('application/vnd.google-apps.spreadsheet')
        .setSelectFolderEnabled(false)

      const picker = new window.google.picker.PickerBuilder()
        .addView(docsView)
        .setOAuthToken(accessToken)
        .setCallback(async (data) => {
          setIsLoading(false)
          
          if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.PICKED) {
            const file = data[window.google.picker.Response.DOCUMENTS][0]
            const spreadsheetId = file.id
            
            // Call the callback with the selected spreadsheet ID and handle errors
            try {
              setIsLoading(true)
              setError('')
              await onSpreadsheetSelected?.(spreadsheetId)
              // If successful, loading will be handled by the component (e.g., column selector or data loaded)
              setIsLoading(false)
            } catch (err) {
              setIsLoading(false)
              // Display error message in UI
              setError(err.message || 'Failed to load spreadsheet. Please try again.')
              console.error('Error loading spreadsheet:', err)
            }
          } else if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.CANCEL) {
            // User cancelled, do nothing
            setIsLoading(false)
          }
        })
        .setSize(1051, 650)
        .setTitle('Select a Google Spreadsheet')
        .build()
      
      picker.setVisible(true)
    } catch (err) {
      setIsLoading(false)
      setError(err.message || 'Failed to open file picker. Please try again.')
      console.error('Picker error:', err)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Your Spreadsheet
        </h2>
        <p className="text-gray-600 mb-6">
          Click the button below to browse and select your Google Spreadsheet. 
          Your spreadsheet should have columns named "Name" and "Duas".
        </p>

        <div className="space-y-4">
          <button
            onClick={createPicker}
            disabled={isLoading || !pickerLoaded || !accessToken}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full"
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
                Opening file picker...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Browse Google Sheets
              </span>
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Setup Instructions:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Create a Google Spreadsheet with columns "Name" and "Duas"</li>
            <li>Make sure you have access to the spreadsheet (own it or it's shared with you)</li>
            <li>Click the button above to open the file picker</li>
            <li>Select your spreadsheet from the list</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

