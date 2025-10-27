'use client'

import { useState, useEffect } from 'react'
import { BadgeProgress } from '@/types'
import { badgeAPI } from '@/services/api'
import { Dialog, DialogTitle, DialogContent, DialogActions } from './Dialog'
import { Button } from './Button'
import { Card } from './Card'
import BadgeIcon from './BadgeIcon'

interface BadgeModalProps {
  open: boolean
  onClose: () => void
  userId: string
}

export default function BadgeModal({ open, onClose, userId }: BadgeModalProps) {
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open && userId) {
      fetchBadgeProgress()
    }
  }, [open, userId])

  const fetchBadgeProgress = async () => {
    try {
      setLoading(true)
      const response = await badgeAPI.getBadgeProgress(userId)
      setBadgeProgress(response.data?.progress || [])
    } catch (error) {
      console.error('Failed to fetch badge progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'clubs': return 'Club Badges'
      case 'notes': return 'Note Badges'
      case 'marketplace': return 'Marketplace Badges'
      default: return category
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'clubs': return '👥'
      case 'notes': return '📝'
      case 'marketplace': return '🛒'
      default: return '🏆'
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Badges</DialogTitle>
      <DialogContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto">
            {badgeProgress.map((category) => (
              <Card key={category.category} className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCategoryIcon(category.category)}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{getCategoryTitle(category.category)}</h3>
                    <span className="text-sm text-gray-600">
                      Progress: {category.current_count} / {Math.max(...category.badges.map(b => b.badge.requirement_count))}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {category.badges
                    .sort((a, b) => a.badge.requirement_count - b.badge.requirement_count)
                    .map((badgeData) => (
                      <div
                        key={badgeData.badge.id}
                        className="flex flex-col items-center p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <BadgeIcon
                          badge={badgeData.badge}
                          earned={badgeData.earned}
                          earnedAt={badgeData.earned_at}
                          size="lg"
                        />
                        <div className="mt-3 text-center">
                          <span className={`font-medium block ${badgeData.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                            {badgeData.badge.name}
                          </span>
                          <span className="text-xs text-gray-600 block mt-1">
                            {badgeData.badge.description}
                          </span>
                          {badgeData.earned && badgeData.earned_at && (
                            <span className="text-xs text-green-600 block mt-1">
                              Earned {new Date(badgeData.earned_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}