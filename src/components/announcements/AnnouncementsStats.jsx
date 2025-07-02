import React from 'react'
import '../styles/AnnouncementsStats.css'

const AnnouncementsStats = ({ announcements }) => {
  // Calculate announcements statistics
  const getAnnouncementsStats = () => {
    const total = announcements.length
    const pinned = announcements.filter(ann => ann.isPinned).length
    const recent = announcements.filter(ann => {
      const createdDate = new Date(ann.createdAt)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return createdDate > weekAgo
    }).length
    
    const withAttachments = announcements.filter(ann => 
      ann.attachments && ann.attachments.length > 0
    ).length
    
    return { total, pinned, recent, withAttachments }
  }

  const stats = getAnnouncementsStats()

  if (announcements.length === 0) {
    return null
  }

  return (
    <div className="announcements-stats">
      <div className="stat-item">
        <span className="stat-number">{stats.total}</span>
        <span className="stat-label">📊 Total</span>
      </div>
      <div className="stat-item">
        <span className="stat-number">{stats.pinned}</span>
        <span className="stat-label">📌 Pinned</span>
      </div>
      <div className="stat-item">
        <span className="stat-number">{stats.recent}</span>
        <span className="stat-label">🆕 This Week</span>
      </div>
      <div className="stat-item">
        <span className="stat-number">{stats.withAttachments}</span>
        <span className="stat-label">📎 With Files</span>
      </div>
    </div>
  )
}

export default AnnouncementsStats
