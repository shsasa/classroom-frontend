import React from 'react'
import { useNavigate } from 'react-router-dom'
import AnnouncementsStats from './AnnouncementsStats'
import '../styles/AnnouncementsHeader.css'

const AnnouncementsHeader = ({ announcements, canCreateAnnouncement }) => {
  const navigate = useNavigate()

  return (
    <div className="announcements-header">
      <div className="header-content">
        <div className="header-text">
          <h1>Announcements</h1>
          <p>Stay updated with the latest news and important updates</p>
        </div>
        
        {/* Stats Section */}
        <AnnouncementsStats announcements={announcements} />
      </div>
      
      {canCreateAnnouncement && (
        <button
          className="add-announcement-btn"
          onClick={() => navigate('/announcements/add')}
          title="Create a new announcement"
        >
          <span className="btn-icon">✏️</span>
          <span className="btn-text">Add New Announcement</span>
        </button>
      )}
    </div>
  )
}

export default AnnouncementsHeader
