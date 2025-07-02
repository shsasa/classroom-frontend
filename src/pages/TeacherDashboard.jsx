import React, { useState, useEffect, useContext, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { toast } from 'react-toastify'
import '../styles/TeacherDashboard.css'

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    batches: [],
    assignments: [],
    students: [],
    totalStudents: 0,
    totalBatches: 0,
    totalAssignments: 0,
    upcomingClasses: []
  })

  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      navigate('/')
      return
    }
    fetchDashboardData()
  }, [user, navigate, fetchDashboardData])

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch teacher's batches
      const batchesResponse = await api.get('/batches/teacher')
      const batches = batchesResponse.data

      // Fetch teacher's assignments
      const assignmentsResponse = await api.get('/assignments/teacher')
      const assignments = assignmentsResponse.data

      // Calculate statistics
      const totalStudents = batches.reduce((total, batch) =>
        total + (batch.students?.length || 0), 0
      )

      setDashboardData({
        batches,
        assignments,
        totalStudents,
        totalBatches: batches.length,
        totalAssignments: assignments.length,
        upcomingClasses: extractUpcomingClasses(batches)
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  const extractUpcomingClasses = (batches) => {
    const today = new Date().getDay()
    const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today]

    const upcomingClasses = []

    batches.forEach(batch => {
      if (batch.schedule) {
        batch.schedule.forEach(scheduleItem => {
          if (scheduleItem.day === todayName) {
            upcomingClasses.push({
              ...scheduleItem,
              batchName: batch.name,
              batchId: batch._id
            })
          }
        })
      }
    })

    return upcomingClasses.sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getAssignmentStatus = (assignment) => {
    const dueDate = new Date(assignment.dueDate)
    const now = new Date()

    if (now > dueDate) return 'overdue'
    if (dueDate - now < 24 * 60 * 60 * 1000) return 'due-soon'
    return 'active'
  }

  if (loading) {
    return (
      <div className="teacher-dashboard-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="teacher-dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, {user.firstName}!</h1>
          <p>Here's what's happening in your classes today</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/teacher/assignments/create')}
          >
            + Create Assignment
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{dashboardData.totalStudents}</div>
            <div className="stat-label">Total Students</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-number">{dashboardData.totalBatches}</div>
            <div className="stat-label">My Batches</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-number">{dashboardData.totalAssignments}</div>
            <div className="stat-label">Assignments</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-number">{dashboardData.upcomingClasses.length}</div>
            <div className="stat-label">Today's Classes</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Today's Classes */}
        <div className="content-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">📅</span>
              Today's Classes
            </h3>
          </div>
          <div className="classes-list">
            {dashboardData.upcomingClasses.length > 0 ? (
              dashboardData.upcomingClasses.map((classItem, index) => (
                <div key={index} className="class-item">
                  <div className="class-time">{classItem.startTime} - {classItem.endTime}</div>
                  <div className="class-info">
                    <h4>{classItem.batchName}</h4>
                    {classItem.room && <p>Room: {classItem.room}</p>}
                  </div>
                  <button
                    className="btn btn-outline"
                    onClick={() => navigate(`/batches/${classItem.batchId}`)}
                  >
                    View Batch
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <p>No classes scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        {/* My Batches */}
        <div className="content-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">👥</span>
              My Batches ({dashboardData.totalBatches})
            </h3>
            <button
              className="btn btn-outline"
              onClick={() => navigate('/batches')}
            >
              View All
            </button>
          </div>
          <div className="batches-grid">
            {dashboardData.batches.slice(0, 6).map(batch => (
              <div key={batch._id} className="batch-card">
                <div className="batch-header">
                  <h4>{batch.name}</h4>
                  <span className="student-count">{batch.students?.length || 0} students</span>
                </div>
                <div className="batch-meta">
                  <div className="batch-dates">
                    {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
                  </div>
                </div>
                <div className="batch-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/batches/${batch._id}`)}
                  >
                    View Details
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate(`/teacher/assignments?batch=${batch._id}`)}
                  >
                    Assignments
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="content-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">📝</span>
              Recent Assignments
            </h3>
            <button
              className="btn btn-outline"
              onClick={() => navigate('/teacher/assignments')}
            >
              View All
            </button>
          </div>
          <div className="assignments-list">
            {dashboardData.assignments.slice(0, 5).map(assignment => (
              <div key={assignment._id} className="assignment-item">
                <div className="assignment-info">
                  <h4>{assignment.title}</h4>
                  <p className="assignment-batch">Batch: {assignment.batchId?.name || 'Unknown'}</p>
                  <p className="assignment-due">Due: {formatDate(assignment.dueDate)}</p>
                </div>
                <div className="assignment-status">
                  <span className={`status-badge ${getAssignmentStatus(assignment)}`}>
                    {getAssignmentStatus(assignment) === 'overdue' ? 'Overdue' :
                      getAssignmentStatus(assignment) === 'due-soon' ? 'Due Soon' : 'Active'}
                  </span>
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => navigate(`/teacher/assignments/${assignment._id}`)}
                >
                  View
                </button>
              </div>
            ))}
          </div>
          {dashboardData.assignments.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>No assignments created yet</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/teacher/assignments/create')}
              >
                Create First Assignment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard
