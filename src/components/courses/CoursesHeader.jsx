import React from 'react'
import PropTypes from 'prop-types'

const CoursesHeader = ({
  userRole,
  canManageCourses,
  onAddCourse
}) => {
  const getTitle = () => {
    return userRole === 'teacher' ? 'My Courses' : 'Courses Management'
  }

  return (
    <div className="courses-list-header">
      <h1>{getTitle()}</h1>
      {canManageCourses && (
        <button className="add-course-btn" onClick={onAddCourse}>
          + Add New Course
        </button>
      )}
    </div>
  )
}

CoursesHeader.propTypes = {
  userRole: PropTypes.string,
  canManageCourses: PropTypes.bool,
  onAddCourse: PropTypes.func
}

CoursesHeader.defaultProps = {
  userRole: 'student',
  canManageCourses: false,
  onAddCourse: () => { }
}

export default CoursesHeader
