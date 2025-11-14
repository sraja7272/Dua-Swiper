import axios from 'axios'

/**
 * Fetch headers from a Google Spreadsheet
 * @param {string} spreadsheetId - The ID of the spreadsheet
 * @param {string} accessToken - Google OAuth access token
 * @returns {Promise<Array>} - Array of header strings
 */
export async function fetchSheetHeaders(spreadsheetId, accessToken) {
  if (!spreadsheetId || !accessToken) {
    throw new Error('Spreadsheet ID and access token are required')
  }

  try {
    // Fetch the spreadsheet metadata to get sheet names
    const metadataResponse = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    // Get the first sheet name
    const firstSheetName = metadataResponse.data.sheets[0].properties.title

    // Fetch data from the first sheet (just first row for headers)
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(firstSheetName)}!1:1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    const headers = response.data.values?.[0] || []
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
 * Fetch data from a Google Spreadsheet
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
    // Fetch the spreadsheet metadata to get sheet names
    const metadataResponse = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    // Get the first sheet name
    const firstSheetName = metadataResponse.data.sheets[0].properties.title

    // Fetch data from the first sheet
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(firstSheetName)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    const rows = response.data.values

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
    await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    return true
  } catch (error) {
    return false
  }
}

