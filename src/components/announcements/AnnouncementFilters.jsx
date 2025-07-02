import React from 'react'
import '../styles/AnnouncementFilters.css'

const AnnouncementFilters = ({ 
  filters, 
  onFilterChange, 
  onApplyFilters, 
  onClearFilters, 
  batches = [], 
  courses = [] 
}) => {
  return (
    <div className="filters-section">
      <div className="filters-header">
        <h3>🔍 Filter Announcements</h3>
      </div>
      <div className="filters-grid">
        <div className="filter-group">
          <label>🔍 Search</label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={onFilterChange}
            placeholder="Search announcements..."
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <label>📚 Batch</label>
          <select
            name="batch"
            value={filters.batch}
            onChange={onFilterChange}
            className="filter-select"
          >
            <option value="">All Batches</option>
            {batches.map(batch => (
              <option key={batch._id} value={batch._id}>
                {batch.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>🎓 Course</label>
          <select
            name="course"
            value={filters.course}
            onChange={onFilterChange}
            className="filter-select"
          >
            <option value="">All Courses</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-actions">
          <button className="apply-btn" onClick={onApplyFilters}>
            Apply Filters
          </button>
          <button className="clear-btn" onClick={onClearFilters}>
            Clear All
          </button>
        </div>
      </div>
    </div>
  )
}

export default AnnouncementFilters
