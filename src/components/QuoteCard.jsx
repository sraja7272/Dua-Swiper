export default function QuoteCard({ duas, name }) {
  return (
    <div className="absolute w-full h-full">
      <div className="relative w-full h-full bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-8 flex flex-col justify-between">
        {/* Duas text */}
        <div className="flex-1 flex items-center justify-center px-4 py-4 relative z-10 overflow-hidden min-h-0">
          <p className="text-lg md:text-xl lg:text-2xl text-gray-800 font-serif text-center leading-relaxed break-words overflow-wrap-anywhere max-h-full overflow-y-auto w-full">
            {duas}
          </p>
        </div>

        {/* Name attribution */}
        <div className="flex flex-col items-center gap-2 relative z-10">
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
          <p className="text-xl md:text-2xl text-gray-600 italic font-serif">
            — {name}
          </p>
        </div>
      </div>
    </div>
  )
}

