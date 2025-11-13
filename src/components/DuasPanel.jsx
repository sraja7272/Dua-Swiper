import { useState, useRef } from 'react'
import { commonDuas } from '../data/commonDuas'

export default function DuasPanel({ isOpen, onClose }) {
  const [selectedDua, setSelectedDua] = useState(null)
  const scrollContainerRef = useRef(null)

  const handleDuaClick = (dua) => {
    setSelectedDua(dua)
  }

  const handleBackToList = () => {
    setSelectedDua(null)
  }

  // Prevent scroll propagation to parent when scrolling within panel
  const handleWheel = (e) => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const isAtTop = scrollTop <= 1
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1
    const scrollingDown = e.deltaY > 0
    const scrollingUp = e.deltaY < 0

    // Always stop propagation to prevent page scrolling
    e.stopPropagation()

    // Only prevent default if we're at a boundary and trying to scroll beyond it
    if ((scrollingUp && isAtTop) || (scrollingDown && isAtBottom)) {
      e.preventDefault()
    }
    // Otherwise, let the container scroll normally
  }

  // Prevent touch scroll propagation for mobile devices
  const handleTouchStart = (e) => {
    // Store initial touch position
    const touch = e.touches[0]
    if (touch) {
      scrollContainerRef.current?.setAttribute('data-touch-start', touch.clientY.toString())
    }
  }

  const handleTouchMove = (e) => {
    const container = scrollContainerRef.current
    if (!container) return

    const touch = e.touches[0]
    if (!touch) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const isAtTop = scrollTop <= 1
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1

    const touchStartY = container.getAttribute('data-touch-start')
    if (touchStartY) {
      const deltaY = touch.clientY - parseFloat(touchStartY)
      const scrollingDown = deltaY < 0
      const scrollingUp = deltaY > 0
      
      // Always stop propagation to prevent page scrolling
      e.stopPropagation()

      // Only prevent default if we're at a boundary and trying to scroll beyond it
      if ((scrollingUp && isAtTop) || (scrollingDown && isAtBottom)) {
        e.preventDefault()
      }
      // Otherwise, let the container scroll normally
    }
  }

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-white shadow-2xl z-40 w-80 md:w-96 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-screen flex flex-col max-h-screen">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-bold text-gray-900">
            {selectedDua ? selectedDua.title : 'Common Duas'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Close panel"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overscroll-contain min-h-0"
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {selectedDua ? (
            // Detail View
            <div className="p-6 space-y-6">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
              >
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to List
              </button>

              <div className="space-y-6">
                {/* Arabic Text */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                    Arabic
                  </h3>
                  <p lang="ar" dir="rtl" className="text-2xl md:text-3xl text-gray-900 font-arabic text-right leading-relaxed">
                    {selectedDua.arabic}
                  </p>
                </div>

                {/* Transliteration */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                    Transliteration
                  </h3>
                  <p className="text-lg text-gray-700 italic leading-relaxed">
                    {selectedDua.transliteration}
                  </p>
                </div>

                {/* Meaning */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                    Meaning
                  </h3>
                  <p className="text-base text-gray-800 leading-relaxed">
                    {selectedDua.meaning}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // List View
            <div className="p-4">
              <ul className="space-y-2">
                {commonDuas.map((dua) => (
                  <li key={dua.id}>
                    <button
                      onClick={() => handleDuaClick(dua)}
                      className="w-full text-left p-4 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all duration-200 group"
                    >
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                        {dua.title}
                      </h3>
                      {dua.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {dua.description}
                        </p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

