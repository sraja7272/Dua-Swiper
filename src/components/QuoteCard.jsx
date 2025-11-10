export default function QuoteCard({ duas, name }) {
  return (
    <div className="absolute w-full h-full">
      <div className="relative w-full h-full bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-8 flex flex-col justify-between">
        {/* Duas text */}
        <div className="flex-1 flex items-center justify-center px-4 relative z-10">
          <p className="text-2xl md:text-3xl lg:text-4xl text-gray-800 font-serif text-center leading-relaxed">
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

        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-100 rounded-full opacity-20 -mr-16 -mb-16"></div>
        <div className="absolute top-1/4 right-8 w-2 h-2 bg-blue-300 rounded-full"></div>
        <div className="absolute top-1/3 right-16 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
        <div className="absolute bottom-1/4 left-12 w-2 h-2 bg-indigo-300 rounded-full"></div>
      </div>
    </div>
  )
}

