import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { toast } from 'react-toastify'
import '../styles/StudentCourses.css'

const StudentCourses = () => {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Redirect if not a student
    if (user && user.role !== 'student') {
      navigate('/')
      return
    }

    fetchCourses()
  }, [user, navigate])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await api.get('/courses/student/my-courses')
      setCourses(response.data)
    } catch (error) {
      console.error('Error fetching courses:', error)
      setError('Failed to fetch courses')
      toast.error('Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }

  const handleCourseClick = (courseId) => {
    navigate(`/student/courses/${courseId}`)
  }

  if (loading) {
    return (
      <div className="student-courses-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading your courses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="student-courses-container">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Error Loading Courses</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchCourses}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="student-courses-container">
      {/* Header */}
      <div className="courses-header">
        <div className="courses-header-content">
          <h1>
            <span className="header-icon">📚</span>
            My Courses
          </h1>
          <p className="header-subtitle">
            Courses you are enrolled in through your batches
          </p>
        </div>
        <div className="courses-stats">
          <div className="stat-item">
            <span className="stat-number">{courses.length}</span>
            <span className="stat-label">Enrolled Courses</span>
          </div>
        </div>
      </div>

      {/* Courses Content */}
      <div className="courses-content">
        {courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No Courses Found</h3>
            <p>You are not enrolled in any courses yet.</p>
            <p>Contact your administrator to be added to a batch with courses.</p>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map(course => (
              <div
                key={course._id}
                className="course-card"
                onClick={() => handleCourseClick(course._id)}
              >
                <div className="course-header">
                  <div className="course-icon">📖</div>
                  <h3 className="course-title">{course.name}</h3>
                </div>

                <div className="course-body">
                  {course.description && (
                    <p className="course-description">{course.description}</p>
                  )}

                  <div className="course-teachers">
                    <div className="teachers-label">
                      <span className="label-icon">👨‍🏫</span>
                      Teachers:
                    </div>
                    <div className="teachers-list">
                      {course.teachers && course.teachers.length > 0 ? (
                        course.teachers.map(teacher => (
                          <span key={teacher._id} className="teacher-name">
                            {teacher.name}
                          </span>
                        ))
                      ) : (
                        <span className="no-teachers">No teachers assigned</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="course-footer">
                  <div className="course-meta">
                    <span className="course-date">
                      Added: {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="course-actions">
                    <button className="view-btn">
                      View Details
                      <span className="btn-icon">→</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentCourses
