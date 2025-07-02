import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getFileUrl } from '../../services/api'
import './AnnouncementCard.css'

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
    <div className={`announcement-card-container ${announcement.isPinned ? 'pinned' : ''}`}>
      {announcement.isPinned && (
        <div className="announcement-card-pin-indicator">📌 Pinned</div>
      )}

      <div className="announcement-card-header">
        <h3 className="announcement-card-title">
          {announcement.title || 'Untitled'}
        </h3>
        <div className="announcement-card-meta">
          <div className="announcement-card-meta-item">
            <span className="announcement-card-meta-icon">📅</span>
            <span className="announcement-card-date">
              {formatDate(announcement.createdAt)}
            </span>
          </div>
          {announcement.author && (
            <div className="announcement-card-meta-item">
              <span className="announcement-card-meta-icon">👤</span>
              <span className="announcement-card-author-name">
                {announcement.author.name || 'Unknown Author'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="announcement-card-content">
        <p>{announcement.content || 'No content available'}</p>
      </div>

      {announcement.attachments && announcement.attachments.length > 0 && (
        <div className="announcement-card-attachments">
          <h4>📎 Attachments:</h4>
          <div className="announcement-card-attachments-list">
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
                <div key={index} className="announcement-card-attachment-item">
                  <span className="announcement-card-attachment-icon">📄</span>
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    {fileName}
                  </a>
                  {isFileObject && attachment.size && (
                    <span className="announcement-card-attachment-size">
                      ({(attachment.size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="announcement-card-footer">
        <div className="announcement-card-stats">
          <span className="announcement-card-status-badge active">Active</span>
        </div>

        <div className="announcement-card-actions">
          <button
            className="announcement-card-view-btn"
            onClick={() => navigate(`/announcements/${announcement._id}`)}
          >
            <span className="announcement-card-btn-icon">👁️</span>
            View
          </button>
          {canCreateAnnouncement && (
            <>
              <button
                className="announcement-card-edit-btn"
                onClick={() => navigate(`/announcements/edit/${announcement._id}`)}
              >
                <span className="announcement-card-btn-icon">✏️</span>
                Edit
              </button>
              <button
                className="announcement-card-delete-btn"
                onClick={() => onDelete(announcement._id)}
              >
                <span className="announcement-card-btn-icon">🗑️</span>
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
