import React from 'react'
import PropTypes from 'prop-types'

const CoursesFilters = ({
  filters,
  onFilterChange,
  userRole
}) => {
  // Don't show filters for teachers as they only see their courses
  if (userRole === 'teacher') {
    return null
  }

  return (
    <div className="filters-section">
      <div className="filter-group">
        <input
          type="text"
          name="search"
          placeholder="Search courses..."
          value={filters.search}
          onChange={onFilterChange}
          className="search-input"
        />
      </div>

      <div className="filter-group">
        <select
          name="isActive"
          value={filters.isActive}
          onChange={onFilterChange}
          className="filter-select"
        >
          <option value="">All Courses</option>
          <option value="true">Active Courses</option>
          <option value="false">Inactive Courses</option>
        </select>
      </div>
    </div>
  )
}

CoursesFilters.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string,
    isActive: PropTypes.string
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  userRole: PropTypes.string
}

CoursesFilters.defaultProps = {
  userRole: 'student'
}

export default CoursesFilters
