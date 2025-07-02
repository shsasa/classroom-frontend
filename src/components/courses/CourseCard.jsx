import React from 'react'
import PropTypes from 'prop-types'
import './CourseCard.css'

const CourseCard = ({
  course,
  canManageCourses,
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

  // Safety check for course object
  if (!course || !course._id) {
    return null
  }

  return (
    <div className={`courses-list-card ${!course.isActive ? 'inactive' : ''}`}>
      <div className="courses-list-header">
        <h3 className="courses-list-name">{course.name || 'Untitled Course'}</h3>
        <div className="courses-list-status">
          <span className={`courses-list-status-badge ${course.isActive ? 'active' : 'inactive'}`}>
            {course.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="courses-list-body">
        {course.description && (
          <p className="courses-list-description">{course.description}</p>
        )}

        <div className="courses-list-details">
          <div className="courses-list-detail-item">
            <div className="courses-list-detail-label">Teachers</div>
            <div className="courses-list-detail-value">{course.teachers?.length || 0}</div>
          </div>
          <div className="courses-list-detail-item">
            <div className="courses-list-detail-label">Batches</div>
            <div className="courses-list-detail-value">{course.batches?.length || 0}</div>
          </div>
          {course.attachments?.length > 0 && (
            <div className="courses-list-detail-item">
              <div className="courses-list-detail-label">Files</div>
              <div className="courses-list-detail-value">{course.attachments.length}</div>
            </div>
          )}
        </div>

        <div className="courses-list-meta">
          <small>Created: {formatDate(course.createdAt)}</small>
          {course.updatedAt !== course.createdAt && (
            <small>Updated: {formatDate(course.updatedAt)}</small>
          )}
        </div>
      </div>

      <div className="courses-list-actions">
        <button
          className="courses-list-action-btn courses-list-view-btn"
          onClick={() => onView(course._id)}
        >
          View Details
        </button>

        {canManageCourses && (
          <>
            <button
              className="courses-list-action-btn courses-list-edit-btn"
              onClick={() => onEdit(course._id)}
            >
              Edit
            </button>

            <button
              className="courses-list-action-btn courses-list-delete-btn"
              onClick={() => onDelete(course._id, course.name)}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}

CourseCard.propTypes = {
  course: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    description: PropTypes.string,
    teachers: PropTypes.array,
    batches: PropTypes.array,
    attachments: PropTypes.array,
    isActive: PropTypes.bool,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string
  }).isRequired,
  canManageCourses: PropTypes.bool,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
}

CourseCard.defaultProps = {
  canManageCourses: false,
  onEdit: () => { },
  onDelete: () => { }
}

export default CourseCard
