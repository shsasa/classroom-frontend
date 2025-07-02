import React, { useState, useEffect, useContext, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { toast } from 'react-toastify'
import '../styles/StudentAssignmentDetails.css'

const StudentAssignmentDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAssignmentDetails = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get(`/assignments/student/${id}`)
      setAssignment(response.data)
    } catch (error) {
      console.error('Error fetching assignment details:', error)
      setError('Failed to fetch assignment details or you are not enrolled in this assignment')
      toast.error('Failed to fetch assignment details')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (user && user.role !== 'student') {
      navigate('/')
      return
    }

    fetchAssignmentDetails()
  }, [user, navigate, fetchAssignmentDetails])

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

  const formatTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid Time'
    }
  }

  const getAssignmentStatus = (dueDate) => {
    const now = new Date()
    const due = new Date(dueDate)

    if (due < now) {
      return 'overdue'
    } else if ((due - now) <= 24 * 60 * 60 * 1000) {
      return 'urgent'
    } else {
      return 'pending'
    }
  }

  const getDaysUntilDue = (dueDate) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`
    } else if (diffDays === 0) {
      return 'Due today'
    } else if (diffDays === 1) {
      return 'Due tomorrow'
    } else {
      return `${diffDays} days left`
    }
  }

  if (loading) {
    return (
      <div className="student-assignment-details-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading assignment details...</p>
        </div>
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="student-assignment-details-container">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Error Loading Assignment</h3>
          <p>{error || 'Assignment not found'}</p>
          <button
            className="back-btn"
            onClick={() => navigate('/student/assignments')}
          >
            Back to My Assignments
          </button>
        </div>
      </div>
    )
  }

  const status = getAssignmentStatus(assignment.dueDate)

  return (
    <div className="student-assignment-details-container">
      {/* Header */}
      <div className="assignment-header">
        <div className="assignment-title">{assignment.title}</div>
        <div className="assignment-subtitle">Assignment Details</div>
        <div className={`status-badge-large ${status}`}>
          {status === 'overdue' && '⚠️ Overdue'}
          {status === 'urgent' && '⚡ Due Soon'}
          {status === 'pending' && '⏳ Pending'}
        </div>
      </div>

      {/* Back Button */}
      <button
        className="back-button"
        onClick={() => navigate('/student/assignments')}
      >
        ← Back to My Assignments
      </button>

      {/* Content */}
      <div className="assignment-content">
        {/* Assignment Info */}
        <div className="content-section">
          <div className="section-title">
            <span className="section-icon">📋</span>
            Assignment Information
          </div>

          <div className="assignment-info-grid">
            <div className="info-card">
              <div className="info-icon">🎓</div>
              <div className="info-content">
                <div className="info-label">Batch</div>
                <div className="info-value">{assignment.batch?.name}</div>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">📚</div>
              <div className="info-content">
                <div className="info-label">Course</div>
                <div className="info-value">{assignment.course?.name}</div>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">👨‍🏫</div>
              <div className="info-content">
                <div className="info-label">Teacher</div>
                <div className="info-value">{assignment.teacher?.name}</div>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">📅</div>
              <div className="info-content">
                <div className="info-label">Created</div>
                <div className="info-value">{formatDate(assignment.createdAt)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Due Date */}
        <div className="content-section">
          <div className="section-title">
            <span className="section-icon">⏰</span>
            Due Date & Time
          </div>

          <div className={`due-date-card ${status}`}>
            <div className="due-date-main">
              <div className="due-date-text">
                {formatDate(assignment.dueDate)} at {formatTime(assignment.dueDate)}
              </div>
              <div className={`due-countdown ${status}`}>
                {getDaysUntilDue(assignment.dueDate)}
              </div>
            </div>
            {status === 'overdue' && (
              <div className="overdue-warning">
                <span className="warning-icon">⚠️</span>
                <span>This assignment is overdue. Please submit as soon as possible.</span>
              </div>
            )}
            {status === 'urgent' && (
              <div className="urgent-warning">
                <span className="warning-icon">⚡</span>
                <span>This assignment is due soon. Don't forget to submit!</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {assignment.description && (
          <div className="content-section">
            <div className="section-title">
              <span className="section-icon">📝</span>
              Assignment Description
            </div>
            <div className="description-content">
              {assignment.description}
            </div>
          </div>
        )}

        {/* Attachments */}
        {assignment.attachments && assignment.attachments.length > 0 && (
          <div className="content-section">
            <div className="section-title">
              <span className="section-icon">📎</span>
              Attachments ({assignment.attachments.length})
            </div>
            <div className="attachments-grid">
              {assignment.attachments.map((attachment, index) => (
                <div key={index} className="attachment-item">
                  <div className="attachment-icon">📄</div>
                  <div className="attachment-info">
                    <div className="attachment-name">
                      {attachment.split('/').pop() || `Attachment ${index + 1}`}
                    </div>
                    <div className="attachment-actions">
                      <a
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submission Section */}
        <div className="content-section">
          <div className="section-title">
            <span className="section-icon">📤</span>
            Submission
          </div>
          <div className="submission-placeholder">
            <div className="placeholder-icon">🚧</div>
            <h4>Coming Soon</h4>
            <p>Assignment submission functionality will be available here.</p>
            <div className="placeholder-actions">
              <button className="btn btn-primary" disabled>
                Submit Assignment
              </button>
              <button className="btn btn-outline" disabled>
                Save Draft
              </button>
            </div>
          </div>
        </div>

        {/* Contact Teacher */}
        <div className="content-section">
          <div className="section-title">
            <span className="section-icon">💬</span>
            Need Help?
          </div>
          <div className="contact-teacher">
            <div className="teacher-info">
              <div className="teacher-avatar">👨‍🏫</div>
              <div className="teacher-details">
                <div className="teacher-name">{assignment.teacher?.name}</div>
                <div className="teacher-email">{assignment.teacher?.email}</div>
              </div>
            </div>
            <div className="contact-actions">
              <a
                href={`mailto:${assignment.teacher?.email}?subject=Question about ${assignment.title}`}
                className="btn btn-primary"
              >
                📧 Email Teacher
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentAssignmentDetails
