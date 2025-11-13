import React, { useState, useEffect } from 'react'
import QuoteCard from './QuoteCard'

export default function CardDeck({ duas: initialDuas }) {
  // State to manage the duas array - remove cards as they're navigated
  const [duas, setDuas] = useState(initialDuas)
  const [swipedCards, setSwipedCards] = useState([]) // Track removed cards for restoration
  const [currentIndex, setCurrentIndex] = useState(0)

  // Shuffle array function (Fisher-Yates algorithm)
  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Reset to original duas when prop changes (randomized)
  useEffect(() => {
    const randomizedDuas = shuffleArray(initialDuas)
    setDuas(randomizedDuas)
    setSwipedCards([])
    setCurrentIndex(0)
  }, [initialDuas])

  // canGoBack: true if we've navigated past at least one card
  // canSwipe: true if there are cards left to navigate
  const canGoBack = swipedCards.length > 0
  const canSwipe = duas.length > 0 && currentIndex < duas.length

  const goNext = () => {
    if (!canSwipe || currentIndex >= duas.length) {
      return
    }

    const currentCard = duas[currentIndex]
    
    // Remove the current card from the array
    const newDuas = duas.filter((_, i) => i !== currentIndex)
    setDuas(newDuas)
    
    // Add to swiped cards for restoration
    setSwipedCards(prev => [...prev, { card: currentCard, index: currentIndex }])
    
    // Stay at the same index (which will now show the next card)
    // If we removed the last card, stay at the last index
    const newIndex = newDuas.length > 0 ? Math.min(currentIndex, newDuas.length - 1) : 0
    setCurrentIndex(newIndex)
  }

  const goBack = () => {
    if (!canGoBack || swipedCards.length === 0) return
    
    // Get the last removed card
    const lastRemoved = swipedCards[swipedCards.length - 1]
    
    // Restore the card at its original position
    const newDuas = [...duas]
    newDuas.splice(lastRemoved.index, 0, lastRemoved.card)
    setDuas(newDuas)
    
    // Remove from swiped cards
    setSwipedCards(prev => prev.slice(0, -1))
    
    // Update current index to the restored card
    setCurrentIndex(lastRemoved.index)
  }

  const reset = () => {
    // Reset to original duas (randomized)
    const randomizedDuas = shuffleArray(initialDuas)
    setDuas(randomizedDuas)
    setSwipedCards([])
    setCurrentIndex(0)
  }

  // Show "No Duas Loaded" only if initial duas is empty (not if all duas are swiped)
  if (!initialDuas || initialDuas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-8">
        <div className="text-center">
          <svg
            className="w-24 h-24 mx-auto text-gray-300 mb-4"
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
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Duas Loaded
          </h3>
          <p className="text-gray-500">
            Load a spreadsheet to start viewing duas
          </p>
        </div>
      </div>
    )
  }

  const showCompletionPopup = !canSwipe && duas.length === 0

  return (
    <div className="w-full h-full flex flex-col">
      {/* Card counter - hide when popup shows */}
      {!showCompletionPopup && (
        <div className="flex-shrink-0 flex justify-center pt-4 pb-2 z-40">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md">
            <p className="text-xs font-medium text-gray-600">
              {duas.length > 0 ? (initialDuas.length - duas.length + currentIndex + 1) : initialDuas.length} / {initialDuas.length}
            </p>
          </div>
        </div>
      )}

      {/* Card container - centered with equal padding */}
      <div className="flex-1 flex items-center justify-center px-4 py-4 min-h-0">
        <div className="relative w-full max-w-md h-full max-h-full">
          {duas.length > 0 && currentIndex < duas.length && (
            <div className="absolute inset-0 w-full h-full">
              <QuoteCard duas={duas[currentIndex].duas} name={duas[currentIndex].name} />
            </div>
          )}
        </div>
      </div>

      {/* Navigation buttons - hide when popup shows */}
      {!showCompletionPopup && (
        <div className="flex-shrink-0 flex justify-center items-center gap-4 pb-4 md:pb-6 pt-2 z-40">
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm shadow-lg active:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center border-2 border-gray-200 touch-manipulation"
            title="Back"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={goNext}
            disabled={!canSwipe}
            className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm shadow-lg active:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center border-2 border-gray-200 touch-manipulation"
            title="Next"
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}

      {/* End of deck message */}
      {showCompletionPopup && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-center p-8 bg-white rounded-2xl shadow-2xl max-w-lg w-[90%] sm:w-auto border border-gray-200">
          <div className="mb-6">
            <svg
              className="w-16 h-16 mx-auto text-green-500 mb-4"
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              You're Done!
            </h3>
            <p className="text-gray-600">
              You've completed all {initialDuas.length} duas.
            </p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={reset}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

