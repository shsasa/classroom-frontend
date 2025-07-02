import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { toast } from 'react-toastify'
import '../styles/StudentBatches.css'
import '../styles/GlobalRedThemeOverrides.css'

const StudentBatches = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Only allow students to access this page
    if (user?.role !== 'student') {
      navigate('/')
      return
    }

    fetchStudentBatches()
  }, [user, navigate])

  const fetchStudentBatches = async () => {
    try {
      setLoading(true)
      const response = await api.get('/batches/student/my-batches')
      setBatches(response.data)
    } catch (error) {
      console.error('Error fetching student batches:', error)
      setError('Failed to fetch your batches')
      toast.error('Failed to fetch your batches')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
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

  const handleBatchClick = (batchId) => {
    navigate(`/student/batches/${batchId}`)
  }

  if (loading) {
    return (
      <div className="student-batches-container">
        <div className="loading">Loading your batches...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="student-batches-container">
        <div className="error">
          <div className="error-icon">❌</div>
          <h3>Error Loading Batches</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchStudentBatches}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="student-batches-container">
      <div className="student-batches-header">
        <h1>My Batches</h1>
        <p>Here are all the batches you are enrolled in</p>
      </div>

      {batches.length === 0 ? (
        <div className="no-batches">
          <div className="no-batches-icon">🎓</div>
          <h3>No Batches Found</h3>
          <p>You are not enrolled in any batches yet.</p>
          <p>Contact your administrator to get enrolled in a batch.</p>
        </div>
      ) : (
        <div className="batches-grid">
          {batches.map(batch => {
            const status = getBatchStatus(batch.startDate, batch.endDate)
            return (
              <div
                key={batch._id}
                className={`batch-card `}
                onClick={() => handleBatchClick(batch._id)}
              >
                <div className="batch-card-header">
                  <h3>{batch.name}</h3>
                  <span className={`status-badge ${status}`}>
                    {getStatusText(status)}
                  </span>
                </div>

                {batch.description && (
                  <p className="batch-description">{batch.description}</p>
                )}

                <div className="batch-info">
                  <div className="info-item">
                    <span className="info-icon">📅</span>
                    <div className="info-text">
                      <strong>Duration</strong>
                      <span>{formatDate(batch.startDate)} - {formatDate(batch.endDate)}</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <span className="info-icon">👨‍🏫</span>
                    <div className="info-text">
                      <strong>Teachers</strong>
                      <span>{batch.teachers?.length || 0} teacher(s)</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <span className="info-icon">📚</span>
                    <div className="info-text">
                      <strong>Courses</strong>
                      <span>{batch.courses?.length || 0} course(s)</span>
                    </div>
                  </div>
                </div>

                {batch.schedule && batch.schedule.length > 0 && (
                  <div className="batch-schedule">
                    <strong>Schedule:</strong>
                    <div className="schedule-items">
                      {batch.schedule.slice(0, 2).map((scheduleItem, index) => (
                        <span key={index} className="schedule-item">
                          {scheduleItem.day}: {scheduleItem.startTime} - {scheduleItem.endTime}
                        </span>
                      ))}
                      {batch.schedule.length > 2 && (
                        <span className="schedule-more">+{batch.schedule.length - 2} more</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="batch-card-footer">
                  <span className="view-details">Click to view details →</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default StudentBatches
