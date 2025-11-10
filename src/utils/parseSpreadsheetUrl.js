/**
 * Extract spreadsheet ID from various Google Sheets URL formats
 * @param {string} input - URL or spreadsheet ID
 * @returns {string|null} - Extracted spreadsheet ID or null if invalid
 */
export function parseSpreadsheetUrl(input) {
  if (!input || typeof input !== 'string') {
    return null
  }

  // Trim whitespace
  const trimmed = input.trim()

  // Pattern 1: Full URL with /d/ format
  // https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit...
  const urlPattern = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/
  const urlMatch = trimmed.match(urlPattern)
  if (urlMatch) {
    return urlMatch[1]
  }

  // Pattern 2: Direct spreadsheet ID (alphanumeric with hyphens and underscores)
  const idPattern = /^[a-zA-Z0-9-_]+$/
  if (idPattern.test(trimmed) && trimmed.length > 20) {
    return trimmed
  }

  return null
}

/**
 * Validate if a string is a valid spreadsheet ID
 * @param {string} id - Spreadsheet ID to validate
 * @returns {boolean} - True if valid
 */
export function isValidSpreadsheetId(id) {
  return parseSpreadsheetUrl(id) !== null
}

