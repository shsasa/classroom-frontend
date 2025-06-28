import React, { useState, useEffect, useContext, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllCourses, deleteCourse } from '../services/courses'
import { AuthContext } from '../context/AuthContext'
import { toast } from 'react-toastify'
import '../styles/CoursesList.css'

const CoursesList = () => {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    isActive: '',
  })

  // Check if user can manage courses
  const canManageCourses = user && ['admin', 'supervisor'].includes(user.role)

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const courseFilters = {}
      if (filters.search) courseFilters.search = filters.search
      if (filters.isActive !== '') courseFilters.isActive = filters.isActive === 'true'

      const response = await getAllCourses(courseFilters)
      setCourses(response)
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }, [filters.search, filters.isActive])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddCourse = () => {
    navigate('/add-course')
  }

  const handleEditCourse = (courseId) => {
    navigate(`/edit-course/${courseId}`)
  }

  const handleDeleteCourse = async (courseId, courseName) => {
    if (window.confirm(`Are you sure you want to delete "${courseName}"? This action cannot be undone.`)) {
      try {
        await deleteCourse(courseId)
        toast.success('Course deleted successfully!')
        fetchCourses() // Refresh the list
      } catch (error) {
        console.error('Error deleting course:', error)
        if (error.response?.status === 403) {
          toast.error('Access denied. Only admins and supervisors can delete courses.')
        } else {
          toast.error('Failed to delete course')
        }
      }
    }
  }

  const handleViewCourse = (courseId) => {
    navigate(`/courses/${courseId}`)
  }

  return (
    <div className="courses-list-container">
      <div className="courses-list-header">
        <h1>Courses Management</h1>
        {canManageCourses && (
          <button className="add-course-btn" onClick={handleAddCourse}>
            + Add New Course
          </button>
        )}
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            name="search"
            placeholder="Search courses..."
            value={filters.search}
            onChange={handleFilterChange}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            name="isActive"
            value={filters.isActive}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Courses</option>
            <option value="true">Active Courses</option>
            <option value="false">Inactive Courses</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading courses...</div>
      ) : (
        <div className="courses-content">
          {courses.length === 0 ? (
            <div className="no-courses">
              <h3>No courses found</h3>
              <p>
                {canManageCourses
                  ? 'Start by adding your first course!'
                  : 'No courses are available at the moment.'
                }
              </p>
              {canManageCourses && (
                <button className="add-first-course-btn" onClick={handleAddCourse}>
                  Add First Course
                </button>
              )}
            </div>
          ) : (
            <div className="courses-grid">
              {courses.map(course => (
                <div key={course._id} className={`course-card ${!course.isActive ? 'inactive' : ''}`}>
                  <div className="course-header">
                    <h3 className="course-name">{course.name}</h3>
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
                      <small>Created: {new Date(course.createdAt).toLocaleDateString()}</small>
                      {course.updatedAt !== course.createdAt && (
                        <small>Updated: {new Date(course.updatedAt).toLocaleDateString()}</small>
                      )}
                    </div>
                  </div>

                  <div className="course-actions">
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleViewCourse(course._id)}
                    >
                      View Details
                    </button>

                    {canManageCourses && (
                      <>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEditCourse(course._id)}
                        >
                          Edit
                        </button>

                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteCourse(course._id, course.name)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CoursesList
