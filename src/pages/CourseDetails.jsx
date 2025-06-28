import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCourseById, deleteCourse } from '../services/courses'
import { AuthContext } from '../context/AuthContext'
import { toast } from 'react-toastify'
import '../styles/CourseDetails.css'

const CourseDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  // Check if user can manage courses
  const canManageCourses = user && ['admin', 'supervisor'].includes(user.role)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        console.log('Fetching course with ID:', id)
        const response = await getCourseById(id)
        console.log('Course fetched:', response)
        setCourse(response)
      } catch (error) {
        console.error('Error fetching course:', error)
        if (error.response?.status === 404) {
          toast.error('Course not found')
        } else {
          toast.error('Failed to load course details')
        }
        navigate('/courses')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCourse()
    }
  }, [id, navigate])

  const handleEdit = () => {
    navigate(`/edit-course/${id}`)
  }

  const handleDelete = async () => {
    if (!course) return

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${course.name}"? This action cannot be undone.`
    )

    if (!confirmDelete) return

    setDeleting(true)
    try {
      await deleteCourse(id)
      toast.success('Course deleted successfully!')
      navigate('/courses')
    } catch (error) {
      console.error('Error deleting course:', error)
      if (error.response?.status === 403) {
        toast.error('Access denied. Only admins and supervisors can delete courses.')
      } else {
        toast.error('Failed to delete course')
      }
    } finally {
      setDeleting(false)
    }
  }

  const handleBack = () => {
    navigate('/courses')
  }

  if (loading) {
    return (
      <div className="course-details-container">
        <div className="loading">Loading course details...</div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="course-details-container">
        <div className="error-message">
          <h2>Course not found</h2>
          <button onClick={handleBack} className="back-btn">
            Back to Courses
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="course-details-container">
      <div className="course-details-card">
        <div className="course-details-header">
          <div className="header-content">
            <h1 className="course-title">{course.name}</h1>
            <div className="course-status">
              <span className={`status-badge ${course.isActive ? 'active' : 'inactive'}`}>
                {course.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="action-buttons">
            <button onClick={handleBack} className="back-btn">
              ← Back to Courses
            </button>

            {canManageCourses && (
              <>
                <button
                  onClick={handleEdit}
                  className="edit-btn"
                  disabled={deleting}
                >
                  Edit Course
                </button>

                <button
                  onClick={handleDelete}
                  className="delete-btn"
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete Course'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="course-details-body">
          {course.description && (
            <div className="section">
              <h3>Description</h3>
              <p className="description">{course.description}</p>
            </div>
          )}

          <div className="section">
            <h3>Course Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className={`info-value ${course.isActive ? 'active' : 'inactive'}`}>
                  {course.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">Created:</span>
                <span className="info-value">
                  {new Date(course.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              {course.updatedAt !== course.createdAt && (
                <div className="info-item">
                  <span className="info-label">Last Updated:</span>
                  <span className="info-value">
                    {new Date(course.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="section">
            <h3>Assigned Teachers ({course.teachers?.length || 0})</h3>
            {course.teachers && course.teachers.length > 0 ? (
              <div className="teachers-list">
                {course.teachers.map((teacher, index) => (
                  <div key={teacher._id || teacher.id || index} className="teacher-item">
                    <div className="teacher-info">
                      <span className="teacher-name">
                        {typeof teacher === 'string' ? teacher : teacher.name || 'Unknown Teacher'}
                      </span>
                      {teacher.email && (
                        <span className="teacher-email">{teacher.email}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No teachers assigned to this course</p>
            )}
          </div>

          <div className="section">
            <h3>Batches ({course.batches?.length || 0})</h3>
            {course.batches && course.batches.length > 0 ? (
              <div className="batches-list">
                {course.batches.map((batch, index) => (
                  <div key={batch._id || batch.id || index} className="batch-item">
                    <span className="batch-name">
                      {typeof batch === 'string' ? batch : batch.name || 'Unknown Batch'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No batches assigned to this course</p>
            )}
          </div>

          {course.attachments && course.attachments.length > 0 && (
            <div className="section">
              <h3>Attachments ({course.attachments.length})</h3>
              <div className="attachments-list">
                {course.attachments.map((attachment, index) => (
                  <div key={index} className="attachment-item">
                    <span className="attachment-icon">📎</span>
                    <span className="attachment-name">{attachment}</span>
                    <button
                      className="download-btn"
                      onClick={() => toast.info('Download functionality needs backend implementation')}
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CourseDetails
