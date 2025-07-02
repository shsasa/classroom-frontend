import React, { useState, useEffect, useContext, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { toast } from 'react-toastify'
import '../styles/StudentBatchDetails.css'

const StudentBatchDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [batch, setBatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchBatchDetails = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get(`/batches/student/${id}`)
      setBatch(response.data)
    } catch (error) {
      console.error('Error fetching batch details:', error)
      setError('Failed to fetch batch details or you are not enrolled in this batch')
      toast.error('Failed to fetch batch details')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    // Only allow students to access this page
    if (user?.role !== 'student') {
      navigate('/')
      return
    }

    fetchBatchDetails()
  }, [user, navigate, fetchBatchDetails])

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

  const getBatchStatus = (startDate, endDate) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (now < start) return 'upcoming'
    if (now > end) return 'completed'
    return 'active'
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming': return 'Upcoming'
      case 'active': return 'Active'
      case 'completed': return 'Completed'
      default: return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="student-batch-details-container">
        <div className="loading">Loading batch details...</div>
      </div>
    )
  }

  if (error || !batch) {
    return (
      <div className="student-batch-details-container">
        <div className="error">
          <div className="error-icon">❌</div>
          <h3>Error Loading Batch</h3>
          <p>{error || 'Batch not found'}</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/student/batches')}
          >
            Back to My Batches
          </button>
        </div>
      </div>
    )
  }

  const status = getBatchStatus(batch.startDate, batch.endDate)

  return (
    <div className="student-batch-details-container">
      {/* Header Section */}
      <div className="batch-header">
        <div className="header-content">
          <button
            className="back-button"
            onClick={() => navigate('/student/batches')}
          >
            ← Back to My Batches
          </button>

          <div className="header-info">
            <h1>{batch.name}</h1>
            <div className="header-meta">
              <span className={`status-badge ${status}`}>
                {getStatusText(status)}
              </span>
              <span className="batch-dates">
                {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="batch-content">
        {/* Basic Information */}
        <div className="content-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">📋</span>
              Batch Information
            </h3>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <label>Batch Name</label>
              <span>{batch.name}</span>
            </div>
            <div className="info-item">
              <label>Status</label>
              <span className={`status-badge ${status}`}>
                {getStatusText(status)}
              </span>
            </div>
            <div className="info-item">
              <label>Start Date</label>
              <span>{formatDate(batch.startDate)}</span>
            </div>
            <div className="info-item">
              <label>End Date</label>
              <span>{formatDate(batch.endDate)}</span>
            </div>
            {batch.description && (
              <div className="info-item full-width">
                <label>Description</label>
                <span>{batch.description}</span>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="content-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">📊</span>
              Class Statistics
            </h3>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-number">{batch.students?.length || 0}</div>
                <div className="stat-label">Classmates</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👨‍🏫</div>
              <div className="stat-info">
                <div className="stat-number">{batch.teachers?.length || 0}</div>
                <div className="stat-label">Teachers</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-info">
                <div className="stat-number">{batch.courses?.length || 0}</div>
                <div className="stat-label">Courses</div>
              </div>
            </div>
          </div>
        </div>

        {/* Teachers Section */}
        <div className="content-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">👨‍🏫</span>
              Teachers ({batch.teachers?.length || 0})
            </h3>
          </div>
          <div className="list-content">
            {batch.teachers && batch.teachers.length > 0 ? (
              <div className="users-list">
                {batch.teachers.map(teacher => (
                  <div key={teacher._id} className="user-item">
                    <div className="user-avatar">👨‍🏫</div>
                    <div className="user-info">
                      <span className="user-name">{teacher.name}</span>
                      <span className="user-email">{teacher.email}</span>
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

        {/* Courses Section */}
        <div className="content-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">📚</span>
              Courses ({batch.courses?.length || 0})
            </h3>
          </div>
          <div className="list-content">
            {batch.courses && batch.courses.length > 0 ? (
              <div className="courses-list">
                {batch.courses.map(course => (
                  <div key={course._id} className="course-item">
                    <div className="course-icon">📚</div>
                    <div className="course-info">
                      <span className="course-name">{course.name}</span>
                      <span className="course-desc">{course.description || 'No description available'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <p>No courses assigned yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Schedule Section */}
        <div className="content-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">⏰</span>
              Class Schedule
            </h3>
          </div>
          <div className="list-content">
            {batch.schedule && batch.schedule.length > 0 ? (
              <div className="schedule-list">
                {batch.schedule.map((scheduleItem, index) => (
                  <div key={index} className="schedule-item">
                    <div className="schedule-day">{scheduleItem.day}</div>
                    <div className="schedule-time">
                      {scheduleItem.startTime} - {scheduleItem.endTime}
                    </div>
                    {scheduleItem.room && (
                      <div className="schedule-room">Room: {scheduleItem.room}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">⏰</div>
                <p>No schedule set yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Classmates Section */}
        <div className="content-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">👥</span>
              Classmates ({(batch.students?.length || 1) - 1})
            </h3>
          </div>
          <div className="list-content">
            {batch.students && batch.students.length > 1 ? (
              <div className="users-list">
                {batch.students
                  .filter(student => student._id !== user.id)
                  .map(student => (
                    <div key={student._id} className="user-item">
                      <div className="user-avatar">👤</div>
                      <div className="user-info">
                        <span className="user-name">{student.name}</span>
                        <span className="user-email">{student.email}</span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <p>No other students in this batch yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentBatchDetails
