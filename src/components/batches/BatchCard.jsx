import React from 'react'
import PropTypes from 'prop-types'
import './BatchCard.css'

const BatchCard = ({
  batch,
  canManageBatches,
  onView,
  onEdit,
  onDelete
}) => {
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
        day: 'numeric'
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid Date'
    }
  }

  const getBatchStatus = (startDate, endDate) => {
    if (!startDate || !endDate) return 'unknown'

    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (now < start) return 'upcoming'
    if (now > end) return 'completed'
    return 'active'
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming': return 'Upcoming'
      case 'active': return 'Active'
      case 'completed': return 'Completed'
      default: return 'Unknown'
    }
  }

  // Safety check for batch object
  if (!batch || !batch._id) {
    return null
  }

  const status = getBatchStatus(batch.startDate, batch.endDate)

  return (
    <div className={`batch-card-container ${status}`}>
      <div className="batch-card-header">
        <div className="batch-card-title">{batch.name || 'Untitled Batch'}</div>
        <div className={`batch-card-status-badge ${status}`}>
          {getStatusText(status)}
        </div>
      </div>

      <div className="batch-card-info">
        <div className="batch-card-info-item">
          <span className="batch-card-info-label">Duration:</span>
          <span className="batch-card-info-value">
            {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
          </span>
        </div>
        <div className="batch-card-info-item">
          <span className="batch-card-info-label">Students:</span>
          <span className="batch-card-info-value">{batch.students?.length || 0}</span>
        </div>
        <div className="batch-card-info-item">
          <span className="batch-card-info-label">Courses:</span>
          <span className="batch-card-info-value">{batch.courses?.length || 0}</span>
        </div>
      </div>

      {batch.description && (
        <div className="batch-card-description">
          {batch.description.length > 100
            ? `${batch.description.substring(0, 100)}...`
            : batch.description
          }
        </div>
      )}

      <div className="batch-card-actions">
        <button
          className="batch-card-view-btn"
          onClick={() => onView(batch._id)}
        >
          View Details
        </button>
        {canManageBatches && (
          <>
            <button
              className="batch-card-edit-btn"
              onClick={() => onEdit(batch._id)}
            >
              Edit
            </button>
            <button
              className="batch-card-delete-btn"
              onClick={() => onDelete(batch._id)}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}

BatchCard.propTypes = {
  batch: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    description: PropTypes.string,
    students: PropTypes.array,
    courses: PropTypes.array,
    teachers: PropTypes.array,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    schedule: PropTypes.string,
    isActive: PropTypes.bool,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string
  }).isRequired,
  canManageBatches: PropTypes.bool,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
}

BatchCard.defaultProps = {
  canManageBatches: false,
  onEdit: () => { },
  onDelete: () => { }
}

export default BatchCard
