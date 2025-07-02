import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { toast } from 'react-toastify'
import '../styles/AttendanceManagement.css'

const AttendanceManagement = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [batches, setBatches] = useState([])
  const [selectedBatch, setSelectedBatch] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [students, setStudents] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Check user permissions
  const canManageAttendance = user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'teacher'

  useEffect(() => {
    if (!canManageAttendance) {
      navigate('/')
      return
    }
    fetchBatches()
  }, [user, navigate, canManageAttendance])

  const fetchBatches = async () => {
    try {
      const response = await api.get('/batches')
      setBatches(response.data)
    } catch (error) {
      console.error('Error fetching batches:', error)
      toast.error('Failed to fetch batches')
    }
  }

  const fetchBatchStudents = async (batchId) => {
    try {
      setLoading(true)
      const response = await api.get(`/batches/${batchId}`)
      const batch = response.data
      setStudents(batch.students || [])

      // Initialize attendance records for all students
      const initialRecords = (batch.students || []).map(student => ({
        student: student._id,
        studentName: student.name,
        status: 'present',
        checkInTime: '',
        checkOutTime: '',
        notes: ''
      }))
      setAttendanceRecords(initialRecords)
    } catch (error) {
      console.error('Error fetching batch students:', error)
      toast.error('Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  // Removed unused fetchExistingAttendance function

  const handleBatchChange = (e) => {
    const batchId = e.target.value
    setSelectedBatch(batchId)
    if (batchId) {
      fetchBatchStudents(batchId)
    } else {
      setStudents([])
      setAttendanceRecords([])
    }
  }

  const handleAttendanceChange = (studentId, field, value) => {
    setAttendanceRecords(prev =>
      prev.map(record =>
        record.student === studentId
          ? { ...record, [field]: value }
          : record
      )
    )
  }

  const markAllPresent = () => {
    setAttendanceRecords(prev =>
      prev.map(record => ({ ...record, status: 'present' }))
    )
  }

  const markAllAbsent = () => {
    setAttendanceRecords(prev =>
      prev.map(record => ({ ...record, status: 'absent' }))
    )
  }

  const saveAttendance = async () => {
    if (!selectedBatch || !selectedDate || attendanceRecords.length === 0) {
      toast.error('Please select batch, date and ensure students are loaded')
      return
    }

    try {
      setSaving(true)
      const attendanceData = {
        batch: selectedBatch,
        date: selectedDate,
        period: selectedPeriod || 'General',
        records: attendanceRecords.map(record => ({
          student: record.student,
          status: record.status,
          checkInTime: record.checkInTime,
          checkOutTime: record.checkOutTime,
          notes: record.notes
        }))
      }

      await api.post('/attendance', attendanceData)
      toast.success('Attendance saved successfully!')
    } catch (error) {
      console.error('Error saving attendance:', error)
      toast.error('Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (selectedBatch && selectedDate && attendanceRecords.length > 0) {
      const fetchData = async () => {
        if (!selectedBatch || !selectedDate) return

        try {
          const response = await api.get(`/attendance/batch/${selectedBatch}?date=${selectedDate}`)
          const existingRecords = response.data

          if (existingRecords.length > 0) {
            // Find the record for the selected period or the first one
            const relevantRecord = selectedPeriod
              ? existingRecords.find(record => record.period === selectedPeriod)
              : existingRecords[0]

            if (relevantRecord) {
              setSelectedPeriod(relevantRecord.period || '')
              const updatedRecords = attendanceRecords.map(record => {
                const existingStudentRecord = relevantRecord.records.find(
                  r => r.student._id === record.student
                )
                if (existingStudentRecord) {
                  return {
                    ...record,
                    status: existingStudentRecord.status,
                    checkInTime: existingStudentRecord.checkInTime || '',
                    checkOutTime: existingStudentRecord.checkOutTime || '',
                    notes: existingStudentRecord.notes || ''
                  }
                }
                return record
              })
              setAttendanceRecords(updatedRecords)
              toast.info('Loaded existing attendance for this date')
            }
          }
        } catch (error) {
          console.error('Error fetching existing attendance:', error)
        }
      }
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatch, selectedDate, selectedPeriod, attendanceRecords.length])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="attendance-management-container">
      {/* Header */}
      <div className="attendance-management-header">
        <div className="attendance-management-header-content">
          <h1>📊 Attendance Management</h1>
          <p>Record and manage student attendance for batches</p>
        </div>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="controls-grid">
          <div className="control-group">
            <label>🎓 Select Batch</label>
            <select
              value={selectedBatch}
              onChange={handleBatchChange}
              className="control-select"
            >
              <option value="">Choose a batch...</option>
              {batches.map(batch => (
                <option key={batch._id} value={batch._id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>📅 Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="control-input"
            />
          </div>

          <div className="control-group">
            <label>⏰ Period (Optional)</label>
            <input
              type="text"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              placeholder="e.g., Morning, Afternoon, Math..."
              className="control-input"
            />
          </div>
        </div>

        {selectedDate && (
          <div className="date-display">
            <span className="date-label">Selected Date:</span>
            <span className="date-value">{formatDate(selectedDate)}</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {attendanceRecords.length > 0 && (
        <div className="quick-actions">
          <button className="btn btn-success" onClick={markAllPresent}>
            ✅ Mark All Present
          </button>
          <button className="btn btn-warning" onClick={markAllAbsent}>
            ❌ Mark All Absent
          </button>
          <button
            className="btn btn-primary"
            onClick={saveAttendance}
            disabled={saving}
          >
            {saving ? '💾 Saving...' : '💾 Save Attendance'}
          </button>
        </div>
      )}

      {/* Attendance Table */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading students...</p>
        </div>
      ) : attendanceRecords.length > 0 ? (
        <div className="attendance-table-container">
          <div className="table-header">
            <h3>Student Attendance - {students.length} students</h3>
          </div>
          <div className="attendance-table">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record) => (
                  <tr key={record.student} className={`status-${record.status}`}>
                    <td className="student-name">
                      <div className="student-info">
                        <span className="name">{record.studentName}</span>
                      </div>
                    </td>
                    <td>
                      <select
                        value={record.status}
                        onChange={(e) => handleAttendanceChange(record.student, 'status', e.target.value)}
                        className={`status-select status-${record.status}`}
                      >
                        <option value="present">✅ Present</option>
                        <option value="absent">❌ Absent</option>
                        <option value="late">⏰ Late</option>
                        <option value="left_early">🚪 Left Early</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="time"
                        value={record.checkInTime}
                        onChange={(e) => handleAttendanceChange(record.student, 'checkInTime', e.target.value)}
                        className="time-input"
                        disabled={record.status === 'absent'}
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        value={record.checkOutTime}
                        onChange={(e) => handleAttendanceChange(record.student, 'checkOutTime', e.target.value)}
                        className="time-input"
                        disabled={record.status === 'absent'}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={record.notes}
                        onChange={(e) => handleAttendanceChange(record.student, 'notes', e.target.value)}
                        placeholder="Add notes..."
                        className="notes-input"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : selectedBatch ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No Students Found</h3>
          <p>This batch doesn't have any students enrolled yet.</p>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🎓</div>
          <h3>Select a Batch</h3>
          <p>Choose a batch to start recording attendance.</p>
        </div>
      )}
    </div>
  )
}

export default AttendanceManagement
