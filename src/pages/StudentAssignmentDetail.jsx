import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { toast } from 'react-toastify'
import '../styles/StudentAssignmentDetail.css'

const StudentAssignmentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Submission form state
  const [content, setContent] = useState('')
  const [attachmentUrls, setAttachmentUrls] = useState([''])
  const [showSubmissionForm, setShowSubmissionForm] = useState(false)

  useEffect(() => {
    if (user?.role !== 'student') {
      navigate('/')
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/assignments/student/${id}/submission-status`)
        setData(response.data)

        // If student has submitted, populate form with existing data
        if (response.data.submission) {
          setContent(response.data.submission.content || '')
          setAttachmentUrls(response.data.submission.attachments.length > 0
            ? response.data.submission.attachments
            : [''])
        }
      } catch (error) {
        console.error('Error fetching assignment details:', error)
        setError('Failed to fetch assignment details')
        toast.error('Failed to fetch assignment details')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, user, navigate])

  const fetchAssignmentDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/assignments/student/${id}/submission-status`)
      setData(response.data)

      // If student has submitted, populate form with existing data
      if (response.data.submission) {
        setContent(response.data.submission.content || '')
        setAttachmentUrls(response.data.submission.attachments.length > 0
          ? response.data.submission.attachments
          : [''])
      }
    } catch (error) {
      console.error('Error fetching assignment details:', error)
      setError('Failed to fetch assignment details')
      toast.error('Failed to fetch assignment details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim() && attachmentUrls.every(url => !url.trim())) {
      toast.error('Please provide content or at least one attachment')
      return
    }

    try {
      setSubmitting(true)

      const submissionData = {
        content: content.trim(),
        attachments: attachmentUrls.filter(url => url.trim())
      }

      let response
      if (data.hasSubmitted) {
        // Update existing submission
        response = await api.put(`/submissions/student/update/${id}`, submissionData)
        toast.success('Submission updated successfully!')
      } else {
        // Create new submission
        response = await api.post(`/submissions/student/submit/${id}`, submissionData)
        toast.success(response.data.msg || 'Assignment submitted successfully!')
      }

      // Refresh data
      fetchAssignmentDetails()
      setShowSubmissionForm(false)
    } catch (error) {
      console.error('Error submitting assignment:', error)
      const errorMsg = error.response?.data?.msg || 'Failed to submit assignment'
      toast.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const addAttachmentField = () => {
    setAttachmentUrls([...attachmentUrls, ''])
  }

  const removeAttachmentField = (index) => {
    setAttachmentUrls(attachmentUrls.filter((_, i) => i !== index))
  }

  const updateAttachmentUrl = (index, value) => {
    const updated = [...attachmentUrls]
    updated[index] = value
    setAttachmentUrls(updated)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusInfo = () => {
    if (!data) return { status: '', className: '', message: '' }

    if (data.hasSubmitted) {
      if (data.submission.isLate) {
        return {
          status: 'Submitted Late',
          className: 'late',
          message: `Submitted on ${formatDate(data.submission.submittedAt)}`
        }
      } else {
        return {
          status: 'Submitted',
          className: 'submitted',
          message: `Submitted on ${formatDate(data.submission.submittedAt)}`
        }
      }
    } else if (data.isOverdue) {
      return {
        status: 'Overdue',
        className: 'overdue',
        message: 'Assignment deadline has passed'
      }
    } else if (data.canSubmit) {
      return {
        status: 'Pending',
        className: 'pending',
        message: 'Assignment not submitted yet'
      }
    } else {
      return {
        status: 'Closed',
        className: 'closed',
        message: 'Assignment is no longer active'
      }
    }
  }

  if (loading) {
    return (
      <div className="student-assignment-detail-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading assignment details...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="student-assignment-detail-container">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Error Loading Assignment</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchAssignmentDetails}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const { assignment, submission, hasSubmitted, canSubmit, isOverdue } = data
  const statusInfo = getStatusInfo()

  return (
    <div className="student-assignment-detail-container">
      {/* Header */}
      <div className="assignment-detail-header">
        <div className="assignment-detail-header-content">
          <button className="back-btn" onClick={() => navigate('/student/assignments')}>
            ← Back to Assignments
          </button>
          <h1>{assignment.title}</h1>
          <div className={`status-badge ${statusInfo.className}`}>
            {statusInfo.status}
          </div>
        </div>
      </div>

      {/* Assignment Info */}
      <div className="assignment-info-section">
        <div className="assignment-meta">
          <div className="meta-item">
            <span className="meta-icon">🎓</span>
            <span className="meta-label">Batch:</span>
            <span className="meta-value">{assignment.batch?.name}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">📚</span>
            <span className="meta-label">Course:</span>
            <span className="meta-value">{assignment.course?.name}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">👨‍🏫</span>
            <span className="meta-label">Teacher:</span>
            <span className="meta-value">{assignment.teacher?.name}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">📅</span>
            <span className="meta-label">Due Date:</span>
            <span className="meta-value">{formatDate(assignment.dueDate)}</span>
          </div>
        </div>
      </div>

      {/* Assignment Description */}
      {assignment.description && (
        <div className="assignment-description-section">
          <h3>Assignment Description</h3>
          <div className="description-content">
            {assignment.description}
          </div>
        </div>
      )}

      {/* Assignment Attachments */}
      {assignment.attachments && assignment.attachments.length > 0 && (
        <div className="assignment-attachments-section">
          <h3>Assignment Files</h3>
          <div className="attachments-list">
            {assignment.attachments.map((attachment, index) => (
              <a
                key={index}
                href={attachment}
                target="_blank"
                rel="noopener noreferrer"
                className="attachment-link"
              >
                📎 {attachment.split('/').pop() || `Attachment ${index + 1}`}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Submission Status */}
      <div className="submission-status-section">
        <div className={`status-card ${statusInfo.className}`}>
          <h3>Submission Status</h3>
          <p>{statusInfo.message}</p>

          {submission && submission.grade !== undefined && (
            <div className="grade-info">
              <span className="grade-label">Grade:</span>
              <span className="grade-value">{submission.grade}</span>
            </div>
          )}

          {submission && submission.feedback && (
            <div className="feedback-info">
              <span className="feedback-label">Teacher Feedback:</span>
              <div className="feedback-content">{submission.feedback}</div>
            </div>
          )}
        </div>
      </div>

      {/* Current Submission Display */}
      {hasSubmitted && (
        <div className="current-submission-section">
          <h3>Your Submission</h3>
          <div className="submission-content">
            {submission.content && (
              <div className="submission-text">
                <h4>Content:</h4>
                <p>{submission.content}</p>
              </div>
            )}

            {submission.attachments && submission.attachments.length > 0 && (
              <div className="submission-attachments">
                <h4>Attachments:</h4>
                <div className="attachments-list">
                  {submission.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="attachment-link"
                    >
                      🔗 {attachment}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submission Form */}
      {(canSubmit || (hasSubmitted && !isOverdue)) && (
        <div className="submission-form-section">
          {!showSubmissionForm ? (
            <button
              className="btn btn-primary"
              onClick={() => setShowSubmissionForm(true)}
            >
              {hasSubmitted ? 'Update Submission' : 'Submit Assignment'}
            </button>
          ) : (
            <div className="submission-form">
              <h3>{hasSubmitted ? 'Update Your Submission' : 'Submit Assignment'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="content">Content/Answer:</label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your answer or submission content here..."
                    rows="6"
                  />
                </div>

                <div className="form-group">
                  <label>Attachments (URLs or file links):</label>
                  {attachmentUrls.map((url, index) => (
                    <div key={index} className="attachment-input-group">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateAttachmentUrl(index, e.target.value)}
                        placeholder="https://drive.google.com/... or file URL"
                      />
                      {attachmentUrls.length > 1 && (
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => removeAttachmentField(index)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={addAttachmentField}
                  >
                    + Add Another Attachment
                  </button>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowSubmissionForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : (hasSubmitted ? 'Update Submission' : 'Submit Assignment')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default StudentAssignmentDetail
