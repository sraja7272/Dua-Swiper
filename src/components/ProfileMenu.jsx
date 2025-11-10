import { useState, useRef, useEffect } from 'react'

export default function ProfileMenu({ user, onSignOut, onChangeSpreadsheet }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])

  if (!user) {
    return null
  }

  const handleSignOut = () => {
    setIsOpen(false)
    onSignOut()
  }

  const handleChangeSheet = () => {
    setIsOpen(false)
    onChangeSpreadsheet()
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Profile menu"
      >
        <img
          src={user.picture}
          alt={user.name}
          className="w-full h-full object-cover"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[100]">
          {/* Account Name */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 truncate mt-1">
              {user.email}
            </p>
          </div>

          {/* Change Sheet Button */}
          <button
            onClick={handleChangeSheet}
            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Change Sheet
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
          >
            <svg
              className="w-5 h-5 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

