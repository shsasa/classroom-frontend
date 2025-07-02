import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { toast } from 'react-toastify'
import '../styles/TeacherAssignments.css'

const TeacherAssignments = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all, active, upcoming, overdue

  useEffect(() => {
    // Only allow teachers to access this page
    if (user?.role !== 'teacher') {
      navigate('/')
      return
    }

    fetchTeacherAssignments()
  }, [user, navigate])

  const fetchTeacherAssignments = async () => {
    try {
      setLoading(true)
      const response = await api.get('/assignments/teacher/my-assignments')
      setAssignments(response.data)
    } catch (error) {
      console.error('Error fetching teacher assignments:', error)
      setError('Failed to fetch your assignments')
      toast.error('Failed to fetch your assignments')
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
    } else if ((due - now) <= 24 * 60 * 60 * 1000) { // Due within 24 hours
      return 'urgent'
    } else {
      return 'active'
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

  const filterAssignments = (assignments, filterType) => {
    switch (filterType) {
      case 'active':
        return assignments.filter(assignment => getAssignmentStatus(assignment.dueDate) === 'active')
      case 'urgent':
        return assignments.filter(assignment => getAssignmentStatus(assignment.dueDate) === 'urgent')
      case 'overdue':
        return assignments.filter(assignment => getAssignmentStatus(assignment.dueDate) === 'overdue')
      default:
        return assignments
    }
  }

  const filteredAssignments = filterAssignments(assignments, filter)

  const getStatusCounts = () => {
    const active = assignments.filter(a => getAssignmentStatus(a.dueDate) === 'active').length
    const urgent = assignments.filter(a => getAssignmentStatus(a.dueDate) === 'urgent').length
    const overdue = assignments.filter(a => getAssignmentStatus(a.dueDate) === 'overdue').length
    return { active, urgent, overdue, total: assignments.length }
  }

  const statusCounts = getStatusCounts()

  if (loading) {
    return (
      <div className="teacher-assignments-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading your assignments...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="teacher-assignments-container">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Error Loading Assignments</h3>
          <p>{error}</p>
          <button className="teacher-assignments-btn teacher-assignments-btn-primary" onClick={fetchTeacherAssignments}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="teacher-assignments-container">
      {/* Header */}
      <div className="assignments-header">
        <div className="teacher-assignments-header-content">
          <h1>My Assignments</h1>
          <p>Manage all assignments you've created for your courses</p>
        </div>
        <Link to="/assignments/create" className="teacher-assignments-btn teacher-assignments-btn-primary">
          <i className="fas fa-plus"></i> Create New Assignment
        </Link>
      </div>

      {/* Statistics */}
      <div className="teacher-assignments-stats-grid">
        <div className="teacher-assignments-stat-card total">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-number">{statusCounts.total}</div>
            <div className="stat-label">Total Assignments</div>
          </div>
        </div>
        <div className="teacher-assignments-stat-card active">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{statusCounts.active}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="teacher-assignments-stat-card urgent">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-number">{statusCounts.urgent}</div>
            <div className="stat-label">Due Soon</div>
          </div>
        </div>
        <div className="teacher-assignments-stat-card overdue">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-number">{statusCounts.overdue}</div>
            <div className="stat-label">Overdue</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-buttons">
          <button
            className={`teacher-assignments-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({statusCounts.total})
          </button>
          <button
            className={`teacher-assignments-filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({statusCounts.active})
          </button>
          <button
            className={`teacher-assignments-filter-btn ${filter === 'urgent' ? 'active' : ''}`}
            onClick={() => setFilter('urgent')}
          >
            Due Soon ({statusCounts.urgent})
          </button>
          <button
            className={`teacher-assignments-filter-btn ${filter === 'overdue' ? 'active' : ''}`}
            onClick={() => setFilter('overdue')}
          >
            Overdue ({statusCounts.overdue})
          </button>
        </div>
      </div>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <div className="no-assignments">
          <div className="no-assignments-icon">📝</div>
          <h3>No assignments found</h3>
          <p>
            {filter === 'all'
              ? "You haven't created any assignments yet."
              : `No ${filter} assignments found.`
            }
          </p>
          {filter === 'all' && (
            <Link to="/assignments/create" className="teacher-assignments-btn teacher-assignments-btn-primary">
              Create Your First Assignment
            </Link>
          )}
        </div>
      ) : (
        <div className="assignments-grid">
          {filteredAssignments.map(assignment => {
            const status = getAssignmentStatus(assignment.dueDate)
            return (
              <div key={assignment._id} className={`assignment-card ${status}`}>
                <div className="assignment-header">
                  <div className="assignment-title">{assignment.title}</div>
                  <div className={`teacher-assignments-status-badge ${status}`}>
                    {status === 'overdue' && '⚠️ Overdue'}
                    {status === 'urgent' && '⚡ Due Soon'}
                    {status === 'active' && '✅ Active'}
                  </div>
                </div>

                <div className="assignment-meta">
                  <div className="meta-item">
                    <span className="meta-icon">🎓</span>
                    <span className="meta-text">{assignment.batch?.name}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">📚</span>
                    <span className="meta-text">{assignment.course?.name}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">👥</span>
                    <span className="meta-text">{assignment.submissionCount || 0} submissions</span>
                  </div>
                </div>

                {assignment.description && (
                  <div className="assignment-description">
                    {assignment.description.length > 100
                      ? `${assignment.description.substring(0, 100)}...`
                      : assignment.description
                    }
                  </div>
                )}

                <div className="assignment-footer">
                  <div className="due-date">
                    <div className="due-label">Due Date</div>
                    <div className="due-value">
                      {formatDate(assignment.dueDate)} at {formatTime(assignment.dueDate)}
                    </div>
                    <div className={`due-countdown ${status}`}>
                      {getDaysUntilDue(assignment.dueDate)}
                    </div>
                  </div>
                  <div className="assignment-actions">
                    <Link
                      to={`/teacher/assignments/${assignment._id}`}
                      className="teacher-assignments-btn teacher-assignments-btn-sm teacher-assignments-btn-secondary"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/assignments/edit/${assignment._id}`}
                      className="teacher-assignments-btn teacher-assignments-btn-sm teacher-assignments-btn-outline"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TeacherAssignments
