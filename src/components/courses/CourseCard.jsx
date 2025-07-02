import React from 'react'
import PropTypes from 'prop-types'

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
    <div className={`course-card ${!course.isActive ? 'inactive' : ''}`}>
      <div className="course-header">
        <h3 className="course-name">{course.name || 'Untitled Course'}</h3>
        <div className="course-status">
          <span className={`status-badge ${course.isActive ? 'active' : 'inactive'}`}>
            {course.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="course-body">
        {course.description && (
          <p className="course-description">{course.description}</p>
        )}

        <div className="course-info">
          <div className="info-item">
            <span className="info-label">Teachers:</span>
            <span className="info-value">
              {course.teachers?.length || 0}
            </span>
          </div>

          <div className="info-item">
            <span className="info-label">Batches:</span>
            <span className="info-value">
              {course.batches?.length || 0}
            </span>
          </div>

          {course.attachments?.length > 0 && (
            <div className="info-item">
              <span className="info-label">Attachments:</span>
              <span className="info-value">
                {course.attachments.length}
              </span>
            </div>
          )}
        </div>

        <div className="course-dates">
          <small>Created: {formatDate(course.createdAt)}</small>
          {course.updatedAt !== course.createdAt && (
            <small>Updated: {formatDate(course.updatedAt)}</small>
          )}
        </div>
      </div>

      <div className="course-actions">
        <button
          className="action-btn view-btn"
          onClick={() => onView(course._id)}
        >
          View Details
        </button>

        {canManageCourses && (
          <>
            <button
              className="action-btn edit-btn"
              onClick={() => onEdit(course._id)}
            >
              Edit
            </button>

            <button
              className="action-btn delete-btn"
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
