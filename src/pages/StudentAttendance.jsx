import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { toast } from 'react-toastify'
import '../styles/StudentAttendance.css'

const StudentAttendance = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [filteredRecords, setFilteredRecords] = useState([])
  const [batches, setBatches] = useState([])
  const [selectedBatch, setSelectedBatch] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [stats, setStats] = useState({
    totalSessions: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    leftEarlyCount: 0
  })
  const [loading, setLoading] = useState(false)

  // Check user permissions
  useEffect(() => {
    if (user?.role !== 'student') {
      navigate('/')
      return
    }

    const initializeData = async () => {
      await fetchStudentBatches()
      await fetchAttendanceHistory()
    }

    initializeData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate])

  const fetchStudentBatches = async () => {
    try {
      const response = await api.get('/batches/student/my-batches')
      setBatches(response.data)
    } catch (error) {
      console.error('Error fetching student batches:', error)
      toast.error('Failed to fetch batches')
    }
  }

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true)
      const response = await api.get('/attendance/student/my-attendance')
      setAttendanceRecords(response.data)
      setFilteredRecords(response.data)
      calculateStats(response.data)
    } catch (error) {
      console.error('Error fetching attendance history:', error)
      toast.error('Failed to fetch attendance history')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (records) => {
    const stats = {
      totalSessions: 0,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      leftEarlyCount: 0
    }

    records.forEach(attendanceRecord => {
      attendanceRecord.records.forEach(record => {
        stats.totalSessions++
        switch (record.status) {
          case 'present':
            stats.presentCount++
            break
          case 'absent':
            stats.absentCount++
            break
          case 'late':
            stats.lateCount++
            break
          case 'left_early':
            stats.leftEarlyCount++
            break
        }
      })
    })

    setStats(stats)
  }

  const handleFilterChange = () => {
    let filtered = attendanceRecords

    if (selectedBatch) {
      filtered = filtered.filter(record => record.batch._id === selectedBatch)
    }

    if (selectedMonth) {
      filtered = filtered.filter(record => {
        const recordMonth = new Date(record.date).toISOString().substring(0, 7)
        return recordMonth === selectedMonth
      })
    }

    setFilteredRecords(filtered)
    calculateStats(filtered)
  }

  useEffect(() => {
    handleFilterChange()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatch, selectedMonth, attendanceRecords])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return '✅'
      case 'absent':
        return '❌'
      case 'late':
        return '⏰'
      case 'left_early':
        return '🚪'
      default:
        return '❓'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'present':
        return 'Present'
      case 'absent':
        return 'Absent'
      case 'late':
        return 'Late'
      case 'left_early':
        return 'Left Early'
      default:
        return 'Unknown'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return '-'
    return timeString
  }

  const getAttendancePercentage = () => {
    if (stats.totalSessions === 0) return 0
    return Math.round((stats.presentCount / stats.totalSessions) * 100)
  }

  return (
    <div className="student-attendance-container">
      {/* Header */}
      <div className="student-attendance-header">
        <div className="student-attendance-header-content">
          <h1>📊 My Attendance</h1>
          <p>View your attendance history and statistics</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-number">{getAttendancePercentage()}%</div>
              <div className="stat-label">Attendance Rate</div>
            </div>
          </div>
          <div className="stat-card success">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-number">{stats.presentCount}</div>
              <div className="stat-label">Present</div>
            </div>
          </div>
          <div className="stat-card danger">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <div className="stat-number">{stats.absentCount}</div>
              <div className="stat-label">Absent</div>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <div className="stat-number">{stats.lateCount}</div>
              <div className="stat-label">Late</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="batch">Filter by Batch:</label>
            <select
              id="batch"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="filter-select"
            >
              <option value="">All Batches</option>
              {batches.map(batch => (
                <option key={batch._id} value={batch._id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="month">Filter by Month:</label>
            <input
              id="month"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="filter-input"
            />
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="attendance-records-section">
        <div className="section-header">
          <h2>📋 Attendance History</h2>
          <div className="total-sessions">
            Total Sessions: {stats.totalSessions}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading attendance history...</p>
          </div>
        ) : filteredRecords.length > 0 ? (
          <div className="attendance-table-container">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Batch</th>
                  <th>Period</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((attendanceRecord) =>
                  attendanceRecord.records.map((record) => (
                    <tr key={`${attendanceRecord._id}-${record._id}`} className={`status-${record.status}`}>
                      <td className="date-cell">
                        {formatDate(attendanceRecord.date)}
                      </td>
                      <td className="batch-cell">
                        <span className="batch-name">{attendanceRecord.batch.name}</span>
                      </td>
                      <td className="period-cell">
                        {attendanceRecord.period || 'General'}
                      </td>
                      <td className="status-cell">
                        <span className={`status-badge status-${record.status}`}>
                          {getStatusIcon(record.status)} {getStatusText(record.status)}
                        </span>
                      </td>
                      <td className="time-cell">
                        {formatTime(record.checkInTime)}
                      </td>
                      <td className="time-cell">
                        {formatTime(record.checkOutTime)}
                      </td>
                      <td className="notes-cell">
                        {record.notes || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No Attendance Records</h3>
            <p>
              {selectedBatch || selectedMonth
                ? "No attendance records found for the selected filters."
                : "You don't have any attendance records yet."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentAttendance
