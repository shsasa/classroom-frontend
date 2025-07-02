import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api, { getFileUrl } from '../services/api'
import { toast } from 'react-toastify'
import '../styles/CourseDetails.css'

const CourseDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Check user permissions
  const canManageCourses = user?.role === 'admin' || user?.role === 'supervisor'
  const canViewCourse = user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'teacher' || user?.role === 'student'

  useEffect(() => {
    if (!canViewCourse) {
      navigate('/')
      return
    }

    const fetchCourseDetails = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/courses/${id}`)
        setCourse(response.data)
      } catch (error) {
        console.error('Error fetching course details:', error)
        const message = error.response?.data?.msg || 'Failed to fetch course details'
        setError(message)
        toast.error(message)
        if (error.response?.status === 404) {
          navigate('/courses')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCourseDetails()
  }, [id, user, navigate, canViewCourse])

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the course "${course.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      await api.delete(`/courses/${id}`)
      toast.success('Course deleted successfully')
      navigate('/courses')
    } catch (error) {
      console.error('Error deleting course:', error)
      const message = error.response?.data?.msg || 'Failed to delete course'
      toast.error(message)
    }
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  if (loading) {
    return (
      <div className="course-details-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading course details...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="course-details-container">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Error Loading Course</h3>
          <p>{error || 'Course not found'}</p>
          <Link to="/courses" className="btn btn-primary">
            Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="course-details-container">
      {/* Header */}
      <div className="course-details-header">
        <div className="header-content">
          <div className="header-info">
            <div className="breadcrumb">
              <Link to="/courses">Courses</Link>
              <span className="separator">›</span>
              <span>{course.name}</span>
            </div>
            <h1>{course.name}</h1>
            {course.description && (
              <p className="course-description">{course.description}</p>
            )}
            <div className="course-status">
              <span className={`status-badge ${course.isActive ? 'active' : 'inactive'}`}>
                {course.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <Link to="/courses" className="btn btn-secondary">
            <span className="btn-icon">←</span>
            Back to Courses
          </Link>
          {canManageCourses && (
            <>
              <Link to={`/edit-course/${course._id}`} className="btn btn-primary">
                <span className="btn-icon">✏️</span>
                Edit Course
              </Link>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
              >
                <span className="btn-icon">🗑️</span>
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="course-content">
        {/* Basic Information */}
        <div className="content-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">📋</span>
              Basic Information
            </h3>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <label>Course Name</label>
              <span>{course.name}</span>
            </div>
            <div className="info-item">
              <label>Status</label>
              <span className={course.isActive ? 'text-success' : 'text-danger'}>
                {course.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="info-item full-width">
              <label>Description</label>
              <span>{course.description || 'No description provided'}</span>
            </div>
            <div className="info-item">
              <label>Created</label>
              <span>{formatDate(course.createdAt)}</span>
            </div>
            <div className="info-item">
              <label>Last Updated</label>
              <span>{formatDate(course.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="content-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">📊</span>
              Statistics
            </h3>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👨‍🏫</div>
              <div className="stat-info">
                <div className="stat-number">{course.teachers?.length || 0}</div>
                <div className="stat-label">Teachers</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎓</div>
              <div className="stat-info">
                <div className="stat-number">{course.batches?.length || 0}</div>
                <div className="stat-label">Batches</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📎</div>
              <div className="stat-info">
                <div className="stat-number">{course.attachments?.length || 0}</div>
                <div className="stat-label">Attachments</div>
              </div>
            </div>
          </div>
        </div>

        {/* Teachers Section */}
        <div className="content-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">👨‍🏫</span>
              Teachers ({course.teachers?.length || 0})
            </h3>
          </div>
          <div className="list-content">
            {course.teachers && course.teachers.length > 0 ? (
              <div className="teachers-list">
                {course.teachers.map((teacher) => (
                  <div key={teacher._id} className="teacher-item">
                    <div className="teacher-info">
                      <div className="teacher-name">{teacher.name}</div>
                      <div className="teacher-email">{teacher.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">👨‍🏫</div>
                <p>No teachers assigned yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Batches Section */}
        <div className="content-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">🎓</span>
              Batches ({course.batches?.length || 0})
            </h3>
          </div>
          <div className="list-content">
            {course.batches && course.batches.length > 0 ? (
              <div className="batches-list">
                {course.batches.map((batch) => (
                  <div key={batch._id} className="batch-item">
                    <div className="batch-info">
                      <Link
                        to={`/batches/${batch._id}`}
                        className="batch-name clickable"
                      >
                        {batch.name}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🎓</div>
                <p>No batches assigned yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Attachments Section */}
        <div className="content-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">📎</span>
              Attachments ({course.attachments?.length || 0})
            </h3>
          </div>
          <div className="list-content">
            {course.attachments && course.attachments.length > 0 ? (
              <div className="attachments-list">
                {course.attachments.map((attachment, index) => {
                  const fileName = attachment.split('/').pop() || attachment
                  const fileUrl = getFileUrl(attachment)

                  return (
                    <div key={index} className="attachment-item">
                      <div className="attachment-icon">📄</div>
                      <div className="attachment-info">
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="attachment-name"
                        >
                          {fileName}
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📎</div>
                <p>No attachments available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetails
