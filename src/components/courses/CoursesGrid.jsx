import React from 'react'
import PropTypes from 'prop-types'
import CourseCard from './CourseCard'

const CoursesGrid = ({
  courses,
  canManageCourses,
  onViewCourse,
  onEditCourse,
  onDeleteCourse
}) => {
  if (!courses || courses.length === 0) {
    return null
  }

  return (
    <div className="courses-grid">
      {courses.map(course => (
        <CourseCard
          key={course._id}
          course={course}
          canManageCourses={canManageCourses}
          onView={onViewCourse}
          onEdit={onEditCourse}
          onDelete={onDeleteCourse}
        />
      ))}
    </div>
  )
}

CoursesGrid.propTypes = {
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired
    })
  ).isRequired,
  canManageCourses: PropTypes.bool,
  onViewCourse: PropTypes.func.isRequired,
  onEditCourse: PropTypes.func,
  onDeleteCourse: PropTypes.func
}

CoursesGrid.defaultProps = {
  canManageCourses: false,
  onEditCourse: () => { },
  onDeleteCourse: () => { }
}

export default CoursesGrid
