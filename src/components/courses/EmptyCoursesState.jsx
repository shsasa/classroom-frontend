import React from 'react'
import PropTypes from 'prop-types'

const EmptyCoursesState = ({
  userRole,
  canManageCourses,
  onAddCourse
}) => {
  const getTitle = () => {
    return userRole === 'teacher' ? 'No courses assigned' : 'No courses found'
  }

  const getMessage = () => {
    if (userRole === 'teacher') {
      return 'You are not assigned to any courses yet. Please contact the administrator.'
    }
    return canManageCourses
      ? 'Start by adding your first course!'
      : 'No courses are available at the moment.'
  }

  return (
    <div className="no-courses">
      <h3>{getTitle()}</h3>
      <p>{getMessage()}</p>
      {canManageCourses && (
        <button className="add-first-course-btn" onClick={onAddCourse}>
          Add First Course
        </button>
      )}
    </div>
  )
}

EmptyCoursesState.propTypes = {
  userRole: PropTypes.string,
  canManageCourses: PropTypes.bool,
  onAddCourse: PropTypes.func
}

EmptyCoursesState.defaultProps = {
  userRole: 'student',
  canManageCourses: false,
  onAddCourse: () => { }
}

export default EmptyCoursesState
