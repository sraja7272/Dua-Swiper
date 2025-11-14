import { useState, useEffect } from 'react'

export default function ColumnSelector({ headers, onColumnsSelected, onCancel }) {
  const [selectedNameColumn, setSelectedNameColumn] = useState('')
  const [selectedDuasColumn, setSelectedDuasColumn] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Auto-select columns if they contain "name" or "dua"
  useEffect(() => {
    const nameIndex = headers.findIndex((h, i) => 
      h.toLowerCase().trim().includes('name')
    )
    const duasIndex = headers.findIndex((h, i) => 
      h.toLowerCase().trim().includes('dua')
    )

    if (nameIndex !== -1) {
      setSelectedNameColumn(nameIndex.toString())
    }
    if (duasIndex !== -1) {
      setSelectedDuasColumn(duasIndex.toString())
    }
  }, [headers])

  const handleConfirm = async () => {
    if (!selectedNameColumn || !selectedDuasColumn) {
      setError('Please select both columns before continuing.')
      return
    }

    if (selectedNameColumn === selectedDuasColumn) {
      setError('Name and Duas columns must be different.')
      return
    }

    setError('')
    setIsLoading(true)
    try {
      await onColumnsSelected?.(parseInt(selectedNameColumn), parseInt(selectedDuasColumn))
    } catch (err) {
      setIsLoading(false)
      setError(err.message || 'Failed to load spreadsheet data. Please try again.')
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Columns
        </h2>
        <p className="text-gray-600 mb-6">
          We couldn't automatically detect the required columns. Please select which column contains the name and which contains the duas.
        </p>

        <div className="space-y-6">
          <div>
            <label htmlFor="name-column" className="block text-sm font-medium text-gray-700 mb-2">
              Name Column
            </label>
            <select
              id="name-column"
              value={selectedNameColumn}
              onChange={(e) => setSelectedNameColumn(e.target.value)}
              className="input-field"
            >
              <option value="">-- Select a column --</option>
              {headers.map((header, index) => (
                <option key={index} value={index}>
                  {header || `Column ${index + 1}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="duas-column" className="block text-sm font-medium text-gray-700 mb-2">
              Duas Column
            </label>
            <select
              id="duas-column"
              value={selectedDuasColumn}
              onChange={(e) => setSelectedDuasColumn(e.target.value)}
              className="input-field"
            >
              <option value="">-- Select a column --</option>
              {headers.map((header, index) => (
                <option key={index} value={index}>
                  {header || `Column ${index + 1}`}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
                'Confirm'
              )}
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

