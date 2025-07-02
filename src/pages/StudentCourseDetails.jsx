import React, { useState, useEffect, useContext, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { toast } from 'react-toastify'
import '../styles/StudentCourseDetails.css'

const StudentCourseDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchCourseDetails = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get(`/courses/student/${id}`)
      setCourse(response.data)
    } catch (error) {
      console.error('Error fetching course details:', error)
      setError('Failed to fetch course details or you are not enrolled in this course')
      toast.error('Failed to fetch course details')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (user && user.role !== 'student') {
      navigate('/')
      return
    }

    fetchCourseDetails()
  }, [user, navigate, fetchCourseDetails])

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  if (loading) {
    return (
      <div className="student-course-details-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading course details...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="student-course-details-container">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Error Loading Course</h3>
          <p>{error || 'Course not found'}</p>
          <button
            className="back-btn"
            onClick={() => navigate('/student/courses')}
          >
            Back to My Courses
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="student-course-details-container">
      {/* Header */}
      <div className="student-course-details-header">
        <div className="course-title">{course.name}</div>
        <div className="course-subtitle">Course Details & Information</div>
        <div className="course-meta">
          <div className="meta-item">
            <span className="meta-icon">📅</span>
            <span className="meta-text">Added {formatDate(course.createdAt)}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">�‍🏫</span>
            <span className="meta-text">{course.teachers?.length || 0} Teacher(s)</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">🎓</span>
            <span className="meta-text">{course.enrolledBatches?.length || 0} Batch(es)</span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <button
        className="back-button"
        onClick={() => navigate('/student/courses')}
      >
        ← Back to My Courses
      </button>

      {/* Content */}
      <div className="course-content">
        {/* Basic Information */}
        <div className="content-section">
          <div className="section-title">
            <span className="section-icon">📋</span>
            Course Information
          </div>
          {course.description && (
            <div className="description-text">
              {course.description}
            </div>
          )}
        </div>

        {/* Teachers Section */}
        <div className="content-section">
          <div className="section-title">
            <span className="section-icon">👨‍🏫</span>
            Course Teachers ({course.teachers?.length || 0})
          </div>
          <div className="teachers-content">
            {course.teachers && course.teachers.length > 0 ? (
              <div className="teachers-list">
                {course.teachers.map(teacher => (
                  <div key={teacher._id} className="teacher-card">
                    <div className="teacher-avatar">👨‍🏫</div>
                    <div className="teacher-info">
                      <h4>{teacher.name}</h4>
                      <div className="teacher-role">Course Instructor</div>
                      <a href={`mailto:${teacher.email}`} className="teacher-email">
                        {teacher.email}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="placeholder-message">
                <div className="empty-icon">👨‍🏫</div>
                <p>No teachers assigned to this course yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Enrolled Batches */}
        {course.enrolledBatches && course.enrolledBatches.length > 0 && (
          <div className="content-section">
            <div className="section-title">
              <span className="section-icon">🎓</span>
              Enrolled Through Batches ({course.enrolledBatches.length})
            </div>
            <div className="info-card">
              <h3>
                <span className="info-card-icon">🎓</span>
                Your Batches
              </h3>
              <ul className="info-list">
                {course.enrolledBatches.map(batch => (
                  <li key={batch._id} className="info-item">
                    <span className="info-label">{batch.name}</span>
                    <button
                      className="btn btn-outline"
                      onClick={() => navigate(`/student/batches/${batch._id}`)}
                    >
                      View Details →
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Course Resources Placeholder */}
        <div className="content-section">
          <div className="section-title">
            <span className="section-icon">📚</span>
            Course Resources
          </div>
          <div className="placeholder-message">
            <div className="coming-soon-icon">🚧</div>
            <h4>Coming Soon</h4>
            <p>Course materials, assignments, and resources will be available here.</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="content-section">
          <div className="section-title">
            <span className="section-icon">⚡</span>
            Quick Actions
          </div>
          <div className="materials-grid">
            <div className="material-item">
              <div className="material-title">📝 Assignments</div>
              <div className="material-type">View and submit assignments</div>
              <div className="material-actions">
                <button className="btn btn-primary" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
            <div className="material-item">
              <div className="material-title">📊 Grades</div>
              <div className="material-type">Check your grades and progress</div>
              <div className="material-actions">
                <button className="btn btn-primary" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
            <div className="material-item">
              <div className="material-title">📅 Schedule</div>
              <div className="material-type">View class schedule and calendar</div>
              <div className="material-actions">
                <button className="btn btn-primary" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
            <div className="material-item">
              <div className="material-title">💬 Discussions</div>
              <div className="material-type">Join course discussions</div>
              <div className="material-actions">
                <button className="btn btn-primary" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentCourseDetails
