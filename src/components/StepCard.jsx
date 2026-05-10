export default function StepCard({ step, title, children, accent = 'red' }) {
  const accents = {
    red: 'border-red-500',
    blue: 'border-blue-500',
    orange: 'border-orange-500',
    green: 'border-green-500',
    gray: 'border-gray-400',
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 ${accents[accent]} p-5 animate-slide-down`}>
      {(step || title) && (
        <div className="flex items-center gap-2 mb-4">
          {step && (
            <span className="w-7 h-7 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
              {step}
            </span>
          )}
          {title && (
            <h2 className="font-display text-gray-800 text-lg leading-tight">{title}</h2>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
