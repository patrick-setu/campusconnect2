'use client'

import { Badge } from '@/types'

interface BadgeIconProps {
  badge: Badge
  earned: boolean
  earnedAt?: string
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

export default function BadgeIcon({ 
  badge, 
  earned, 
  earnedAt, 
  size = 'md',
  showTooltip = true 
}: BadgeIconProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  }

  const tierColors = {
    bronze: earned ? 'from-amber-600 to-amber-800' : 'from-gray-400 to-gray-600',
    silver: earned ? 'from-gray-300 to-gray-500' : 'from-gray-400 to-gray-600', 
    gold: earned ? 'from-yellow-400 to-yellow-600' : 'from-gray-400 to-gray-600'
  }

  return (
    <div className="relative group">
      <div 
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          bg-gradient-to-br ${tierColors[badge.tier]}
          flex items-center justify-center
          ${earned ? 'shadow-lg' : 'opacity-50 grayscale'}
          transition-all duration-200 hover:scale-105
        `}
      >
        <span className="text-white font-bold">
          {badge.category === 'clubs' && '👥'}
          {badge.category === 'notes' && '📝'}  
          {badge.category === 'marketplace' && '🛒'}
        </span>
      </div>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          <div className="font-semibold">{badge.name}</div>
          <div className="text-xs">
            {earned ? `Earned ${earnedAt ? new Date(earnedAt).toLocaleDateString() : ''}` : badge.description}
          </div>
        </div>
      )}
    </div>
  )
}