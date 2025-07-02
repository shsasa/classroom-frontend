import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getFileUrl } from '../services/api'
import '../styles/AnnouncementCard.css'

const AnnouncementCard = ({ 
  announcement, 
  canCreateAnnouncement, 
  onDelete 
}) => {
  const navigate = useNavigate()

  const formatDate = (dateString) => {
    try {
      if (!dateString) {
        return 'No date'
      }
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid Date'
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid Date'
    }
  }

  // Safety check for announcement object
  if (!announcement || !announcement._id) {
    return null
  }

  return (
    <div className={`announcement-card ${announcement.isPinned ? 'pinned' : ''}`}>
      {announcement.isPinned && (
        <div className="pin-indicator">📌 Pinned</div>
      )}

      <div className="announcement-header">
        <h3 className="announcement-title">
          {announcement.title || 'Untitled'}
        </h3>
        <div className="announcement-meta">
          <div className="meta-item">
            <span className="meta-icon">📅</span>
            <span className="announcement-date">
              {formatDate(announcement.createdAt)}
            </span>
          </div>
          {announcement.author && (
            <div className="meta-item">
              <span className="meta-icon">👤</span>
              <span className="author-name">
                {announcement.author.name || 'Unknown Author'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="announcement-content">
        <p>{announcement.content || 'No content available'}</p>
      </div>

      {announcement.attachments && announcement.attachments.length > 0 && (
        <div className="announcement-attachments">
          <h4>📎 Attachments:</h4>
          <div className="attachments-list">
            {announcement.attachments.map((attachment, index) => {
              // Handle both file objects (new format) and URL strings (old format)
              const isFileObject = typeof attachment === 'object' && attachment.filename
              const fileName = isFileObject
                ? attachment.originalName || attachment.filename
                : attachment.split('/').pop()
              const fileUrl = isFileObject
                ? getFileUrl(attachment.filename)
                : attachment

              return (
                <div key={index} className="attachment-item">
                  <span className="attachment-icon">📄</span>
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    {fileName}
                  </a>
                  {isFileObject && attachment.size && (
                    <span className="attachment-size">
                      ({(attachment.size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="announcement-footer">
        <div className="announcement-stats">
          <span className="status-badge active">Active</span>
        </div>

        <div className="announcement-actions">
          <button
            className="action-btn view-btn"
            onClick={() => navigate(`/announcements/${announcement._id}`)}
          >
            <span className="btn-icon">👁️</span>
            View
          </button>
          {canCreateAnnouncement && (
            <>
              <button
                className="action-btn edit-btn"
                onClick={() => navigate(`/announcements/edit/${announcement._id}`)}
              >
                <span className="btn-icon">✏️</span>
                Edit
              </button>
              <button
                className="action-btn delete-btn"
                onClick={() => onDelete(announcement._id)}
              >
                <span className="btn-icon">🗑️</span>
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnnouncementCard
