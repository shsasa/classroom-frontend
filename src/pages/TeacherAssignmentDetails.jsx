import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { toast } from 'react-toastify'
import '../styles/TeacherAssignmentDetails.css'

const TeacherAssignmentDetails = () => {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [assignment, setAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview') // overview, submissions

  useEffect(() => {
    // Only allow teachers to access this page
    if (user?.role !== 'teacher') {
      navigate('/')
      return
    }

    fetchAssignmentDetails()
    fetchSubmissions()
  }, [id, user, navigate]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAssignmentDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/assignments/${id}`)
      setAssignment(response.data)
    } catch (error) {
      console.error('Error fetching assignment details:', error)
      setError('Failed to fetch assignment details')
      toast.error('Failed to fetch assignment details')
    } finally {
      setLoading(false)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const response = await api.get(`/submissions/assignment/${id}`)
      setSubmissions(response.data)
    } catch (error) {
      console.error('Error fetching submissions:', error)
      // Don't show error for submissions as it's not critical
    }
  }

  const handleGradeSubmission = async (submissionId, grade, feedback) => {
    try {
      await api.put(`/submissions/${submissionId}/grade`, {
        grade,
        feedback
      })
      toast.success('Submission graded successfully!')
      fetchSubmissions() // Refresh submissions
    } catch (error) {
      console.error('Error grading submission:', error)
      toast.error('Failed to grade submission')
    }
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
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

  const getAssignmentStatus = () => {
    if (!assignment) return 'unknown'

    const now = new Date()
    const due = new Date(assignment.dueDate)

    if (due < now) {
      return 'overdue'
    } else if ((due - now) <= 24 * 60 * 60 * 1000) {
      return 'urgent'
    } else {
      return 'active'
    }
  }

  const getStatusDisplay = () => {
    const status = getAssignmentStatus()
    switch (status) {
      case 'overdue':
        return { text: 'Overdue', icon: '⚠️', class: 'overdue' }
      case 'urgent':
        return { text: 'Due Soon', icon: '⚡', class: 'urgent' }
      case 'active':
        return { text: 'Active', icon: '✅', class: 'active' }
      default:
        return { text: 'Unknown', icon: '❓', class: 'unknown' }
    }
  }

  const getSubmissionStats = () => {
    const total = submissions.length
    const graded = submissions.filter(s => s.grade !== undefined && s.grade !== null).length
    const pending = total - graded
    return { total, graded, pending }
  }

  if (loading) {
    return (
      <div className="teacher-assignment-details-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading assignment details...</p>
        </div>
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="teacher-assignment-details-container">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Error Loading Assignment</h3>
          <p>{error || 'Assignment not found'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/teacher/assignments')}>
            Back to Assignments
          </button>
        </div>
      </div>
    )
  }

  const statusDisplay = getStatusDisplay()
  const submissionStats = getSubmissionStats()

  return (
    <div className="teacher-assignment-details-container">
      {/* Header */}
      <div className="assignment-header">
        <button
          className="back-btn"
          onClick={() => navigate('/teacher/assignments')}
        >
          ← Back to Assignments
        </button>

        <div className="teacher-assignment-details-header-content">
          <div className="title-section">
            <h1>{assignment.title}</h1>
            <div className={`status-badge ${statusDisplay.class}`}>
              {statusDisplay.icon} {statusDisplay.text}
            </div>
          </div>

          <div className="header-actions">
            <Link
              to={`/assignments/edit/${assignment._id}`}
              className="btn btn-secondary"
            >
              <i className="fas fa-edit"></i> Edit Assignment
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-section">
        <div className="tab-buttons">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            Submissions ({submissionStats.total})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Assignment Info */}
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
                <div className="info-icon">📅</div>
                <div className="info-content">
                  <div className="info-label">Due Date</div>
                  <div className="info-value">{formatDate(assignment.dueDate)}</div>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">📊</div>
                <div className="info-content">
                  <div className="info-label">Submissions</div>
                  <div className="info-value">{submissionStats.total} received</div>
                </div>
              </div>
            </div>

            {/* Submission Statistics */}
            <div className="stats-section">
              <h3>Submission Statistics</h3>
              <div className="submission-stats-grid">
                <div className="stat-card total">
                  <div className="stat-icon">📋</div>
                  <div className="stat-content">
                    <div className="stat-number">{submissionStats.total}</div>
                    <div className="stat-label">Total Submissions</div>
                  </div>
                </div>
                <div className="stat-card graded">
                  <div className="stat-icon">✅</div>
                  <div className="stat-content">
                    <div className="stat-number">{submissionStats.graded}</div>
                    <div className="stat-label">Graded</div>
                  </div>
                </div>
                <div className="stat-card pending">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-content">
                    <div className="stat-number">{submissionStats.pending}</div>
                    <div className="stat-label">Pending Review</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment Description */}
            <div className="content-section">
              <h3>Assignment Description</h3>
              <div className="description-content">
                {assignment.description || 'No description provided.'}
              </div>
            </div>

            {/* Assignment Files */}
            {assignment.files && assignment.files.length > 0 && (
              <div className="content-section">
                <h3>Assignment Files</h3>
                <div className="files-list">
                  {assignment.files.map((file, index) => (
                    <div key={index} className="file-item">
                      <div className="file-icon">📎</div>
                      <div className="file-info">
                        <div className="file-name">{file.originalName || file.filename}</div>
                        <div className="file-size">{file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}</div>
                      </div>
                      <a
                        href={file.url || `/uploads/${file.filename}`}
                        download
                        className="download-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="submissions-tab">
            {submissions.length === 0 ? (
              <div className="no-submissions">
                <div className="no-submissions-icon">📝</div>
                <h3>No Submissions Yet</h3>
                <p>Students haven't submitted their assignments yet.</p>
              </div>
            ) : (
              <div className="submissions-list">
                {submissions.map(submission => (
                  <SubmissionCard
                    key={submission._id}
                    submission={submission}
                    onGrade={handleGradeSubmission}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Submission Card Component
const SubmissionCard = ({ submission, onGrade }) => {
  const [isGrading, setIsGrading] = useState(false)
  const [grade, setGrade] = useState(submission.grade || '')
  const [feedback, setFeedback] = useState(submission.feedback || '')

  const handleGradeSubmit = async (e) => {
    e.preventDefault()
    setIsGrading(true)
    try {
      await onGrade(submission._id, grade, feedback)
      setIsGrading(false)
    } catch {
      setIsGrading(false)
    }
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  return (
    <div className="submission-card">
      <div className="submission-header">
        <div className="student-info">
          <div className="student-name">
            {submission.student?.firstName} {submission.student?.lastName}
          </div>
          <div className="submission-date">
            Submitted: {formatDate(submission.submittedAt)}
          </div>
        </div>
        <div className="submission-status">
          {submission.grade ? (
            <span className="grade-badge graded">Grade: {submission.grade}</span>
          ) : (
            <span className="grade-badge pending">Pending Review</span>
          )}
        </div>
      </div>

      {submission.submissionText && (
        <div className="submission-content">
          <h4>Submission Text:</h4>
          <p>{submission.submissionText}</p>
        </div>
      )}

      {submission.files && submission.files.length > 0 && (
        <div className="submission-files">
          <h4>Submitted Files:</h4>
          <div className="files-list">
            {submission.files.map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-icon">📎</div>
                <div className="file-info">
                  <div className="file-name">{file.originalName}</div>
                </div>
                <a
                  href={file.url || `/uploads/${file.filename}`}
                  download
                  className="download-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grading-section">
        <form onSubmit={handleGradeSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Grade</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Enter grade (e.g., A, 85, Pass)"
              />
            </div>
            <div className="form-group flex-grow">
              <label>Feedback</label>
              <input
                type="text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter feedback for the student"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isGrading}
            >
              {isGrading ? 'Saving...' : 'Save Grade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TeacherAssignmentDetails
