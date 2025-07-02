import React, { useState, useEffect, useContext, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllCourses, deleteCourse, getTeacherCourses } from '../services/courses'
import { AuthContext } from '../context/AuthContext'
import { toast } from 'react-toastify'
import {
  CoursesHeader,
  CoursesFilters,
  CoursesGrid,
  EmptyCoursesState
} from '../components/courses'
import { LoadingSpinner } from '../components/common'
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
      let response

      if (user?.role === 'teacher') {
        // For teachers, get only their assigned courses
        response = await getTeacherCourses()
      } else {
        // For admin/supervisor, get all courses with filters
        const courseFilters = {}
        if (filters.search) courseFilters.search = filters.search
        if (filters.isActive !== '') courseFilters.isActive = filters.isActive === 'true'
        response = await getAllCourses(courseFilters)
      }

      setCourses(response)
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }, [filters.search, filters.isActive, user?.role])

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
      <CoursesHeader
        userRole={user?.role}
        canManageCourses={canManageCourses}
        onAddCourse={handleAddCourse}
      />

      <CoursesFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        userRole={user?.role}
      />

      {loading ? (
        <LoadingSpinner message="Loading courses..." />
      ) : (
        <div className="courses-content">
          {courses.length === 0 ? (
            <EmptyCoursesState
              userRole={user?.role}
              canManageCourses={canManageCourses}
              onAddCourse={handleAddCourse}
            />
          ) : (
            <CoursesGrid
              courses={courses}
              canManageCourses={canManageCourses}
              onViewCourse={handleViewCourse}
              onEditCourse={handleEditCourse}
              onDeleteCourse={handleDeleteCourse}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default CoursesList
