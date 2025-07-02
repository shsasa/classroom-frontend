import React from 'react'
import AnnouncementCard from './AnnouncementCard'
import '../styles/AnnouncementsGrid.css'

const AnnouncementsGrid = ({ announcements, canCreateAnnouncement, onDelete }) => {
  if (!Array.isArray(announcements) || announcements.length === 0) {
    return null
  }

  return (
    <div className="announcements-grid">
      {announcements.map((announcement, index) => {
        // Safety check for announcement object
        if (!announcement || !announcement._id) {
          console.warn(`⚠️ Invalid announcement at index ${index}:`, announcement)
          return null
        }

        return (
          <AnnouncementCard
            key={announcement._id}
            announcement={announcement}
            canCreateAnnouncement={canCreateAnnouncement}
            onDelete={onDelete}
          />
        )
      }).filter(Boolean)} {/* Filter out null values */}
    </div>
  )
}

export default AnnouncementsGrid
