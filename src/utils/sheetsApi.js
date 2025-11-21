import axios from 'axios'

/**
 * Parse CSV text into rows
 * @param {string} csvText - CSV text content
 * @returns {Array<Array<string>>} - Array of rows, each row is an array of cells
 */
function parseCSV(csvText) {
  const rows = []
  let currentRow = []
  let currentCell = ''
  let inQuotes = false

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i]
    const nextChar = csvText[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentCell += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // End of cell
      currentRow.push(currentCell.trim())
      currentCell = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      // End of row
      if (char === '\r' && nextChar === '\n') {
        i++ // Skip \n after \r
      }
      currentRow.push(currentCell.trim())
      currentCell = ''
      if (currentRow.length > 0 && currentRow.some(cell => cell !== '')) {
        rows.push(currentRow)
      }
      currentRow = []
    } else {
      currentCell += char
    }
  }

  // Add last cell and row
  if (currentCell !== '' || currentRow.length > 0) {
    currentRow.push(currentCell.trim())
    if (currentRow.some(cell => cell !== '')) {
      rows.push(currentRow)
    }
  }

  return rows
}

/**
 * Fetch headers from a Google Spreadsheet using Drive API export
 * @param {string} spreadsheetId - The ID of the spreadsheet
 * @param {string} accessToken - Google OAuth access token
 * @returns {Promise<Array>} - Array of header strings
 */
export async function fetchSheetHeaders(spreadsheetId, accessToken) {
  if (!spreadsheetId || !accessToken) {
    throw new Error('Spreadsheet ID and access token are required')
  }

  try {
    // Export spreadsheet as CSV using Drive API (works with drive.file scope)
    const response = await axios.get(
      `https://www.googleapis.com/drive/v3/files/${spreadsheetId}/export`,
      {
        params: {
          mimeType: 'text/csv',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'text',
      }
    )

    const csvText = response.data
    const rows = parseCSV(csvText)
    
    if (rows.length === 0) {
      throw new Error('Spreadsheet is empty')
    }

    const headers = rows[0] || []
    return headers
  } catch (error) {
    // Enhanced error messages
    if (error.response) {
      const status = error.response.status

      if (status === 403) {
        throw new Error(
          'Access denied. Please make sure the spreadsheet is shared with you or set to "Anyone with the link can view".'
        )
      } else if (status === 404) {
        throw new Error(
          'Spreadsheet not found. Please check the URL or ID and try again.'
        )
      } else if (status === 401) {
        throw new Error('Authentication expired. Please sign in again.')
      }
    }

    throw new Error(
      `Failed to fetch spreadsheet headers: ${error.message || 'Unknown error'}`
    )
  }
}

/**
 * Fetch data from a Google Spreadsheet using Drive API export
 * @param {string} spreadsheetId - The ID of the spreadsheet
 * @param {string} accessToken - Google OAuth access token
 * @param {number} [nameColumnIndex] - Optional: index of the name column (0-based)
 * @param {number} [duasColumnIndex] - Optional: index of the duas column (0-based)
 * @returns {Promise<Array>} - Array of duas objects with name and duas properties
 */
export async function fetchSheetData(spreadsheetId, accessToken, nameColumnIndex = null, duasColumnIndex = null) {
  if (!spreadsheetId || !accessToken) {
    throw new Error('Spreadsheet ID and access token are required')
  }

  try {
    // Export spreadsheet as CSV using Drive API (works with drive.file scope)
    const response = await axios.get(
      `https://www.googleapis.com/drive/v3/files/${spreadsheetId}/export`,
      {
        params: {
          mimeType: 'text/csv',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'text',
      }
    )

    const csvText = response.data
    const rows = parseCSV(csvText)

    if (!rows || rows.length === 0) {
      throw new Error('Spreadsheet is empty')
    }

    // First row should be headers
    const headers = rows[0].map((header) => header.toLowerCase().trim())

    // Use provided indices or try to find automatically
    let nameIndex = nameColumnIndex
    let duasIndex = duasColumnIndex

    if (nameIndex === null || nameIndex === undefined) {
      // Find Name column index - look for columns containing "name"
      nameIndex = headers.findIndex(
        (h) => h.includes('name')
      )
    }

    if (duasIndex === null || duasIndex === undefined) {
      // Find Duas column index - look for columns containing "dua"
      duasIndex = headers.findIndex(
        (h) => h.includes('dua')
      )
    }

    if (nameIndex === -1) {
      throw new Error(
        'Could not find a column containing "name". Please ensure your spreadsheet has a column with "name" in its title.'
      )
    }

    if (duasIndex === -1) {
      throw new Error(
        'Could not find a column containing "dua". Please ensure your spreadsheet has a column with "dua" in its title.'
      )
    }

    // Parse data rows (skip header row)
    const duas = []
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const name = row[nameIndex]?.trim()
      const duasText = row[duasIndex]?.trim()

      // Only include rows with both name and duas
      if (name && duasText) {
        duas.push({
          id: i,
          name,
          duas: duasText,
        })
      }
    }

    if (duas.length === 0) {
      throw new Error('No valid duas entries found in the spreadsheet')
    }

    return duas
  } catch (error) {
    // Enhanced error messages
    if (error.response) {
      const status = error.response.status

      if (status === 403) {
        throw new Error(
          'Access denied. Please make sure the spreadsheet is shared with you or set to "Anyone with the link can view".'
        )
      } else if (status === 404) {
        throw new Error(
          'Spreadsheet not found. Please check the URL or ID and try again.'
        )
      } else if (status === 401) {
        throw new Error('Authentication expired. Please sign in again.')
      }
    }

    // Re-throw the error if it's already a custom error message
    if (error.message.includes('column') || error.message.includes('empty')) {
      throw error
    }

    throw new Error(
      `Failed to fetch spreadsheet data: ${error.message || 'Unknown error'}`
    )
  }
}

/**
 * Test if a spreadsheet is accessible with the given token
 * @param {string} spreadsheetId - The ID of the spreadsheet
 * @param {string} accessToken - Google OAuth access token
 * @returns {Promise<boolean>} - True if accessible
 */
export async function testSpreadsheetAccess(spreadsheetId, accessToken) {
  try {
    // Test access using Drive API export (works with drive.file scope)
    await axios.get(
      `https://www.googleapis.com/drive/v3/files/${spreadsheetId}/export`,
      {
        params: {
          mimeType: 'text/csv',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'text',
      }
    )
    return true
  } catch (error) {
    return false
  }
}

