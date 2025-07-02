import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../services/api'
import './BatchAssignments.css'

const BatchAssignments = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [batch, setBatch] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    courseId: '',
    teacherId: '',
    dueDate: ''
  })

  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userRole = user.role
  const canCreateAssignments = ['admin', 'supervisor', 'teacher'].includes(userRole)

  const fetchBatchDetails = useCallback(async () => {
    try {
      const response = await api.get(`/batches/${id}`)
      setBatch(response.data)
    } catch (error) {
      console.error('Error fetching batch details:', error)
      setError('Failed to fetch batch details')
    }
  }, [id])

  const fetchAssignments = useCallback(async () => {
    try {
      const url = selectedCourse
        ? `/batches/${id}/assignments?courseId=${selectedCourse}`
        : `/batches/${id}/assignments`
      const response = await api.get(url)
      setAssignments(response.data)
    } catch (error) {
      console.error('Error fetching assignments:', error)
      setError('Failed to fetch assignments')
    } finally {
      setLoading(false)
    }
  }, [id, selectedCourse])

  useEffect(() => {
    fetchBatchDetails()
  }, [fetchBatchDetails])

  useEffect(() => {
    if (batch) {
      fetchAssignments()
    }
  }, [batch, fetchAssignments])

  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post(`/batches/${id}/assignments`, newAssignment)
      setAssignments([...assignments, response.data.assignment])
      setNewAssignment({
        title: '',
        description: '',
        courseId: '',
        teacherId: '',
        dueDate: ''
      })
      setShowCreateForm(false)
      toast.success('Assignment created successfully!')
    } catch (error) {
      console.error('Error creating assignment:', error)
      setError('Failed to create assignment')
      toast.error('Failed to create assignment')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date()
  }

  if (loading) return <div className="loading">Loading assignments...</div>
  if (error) return <div className="error">{error}</div>
  if (!batch) return <div className="error">Batch not found</div>

  return (
    <div className="batch-assignments-container">
      <div className="batch-assignments-header">
        <div className="header-content">
          <button
            className="back-button"
            onClick={() => navigate(`/batches/${id}`)}
          >
            ← Back to Batch
          </button>
          <h1>Assignments - {batch.name}</h1>
          {canCreateAssignments && (
            <button
              className="create-assignment-btn"
              onClick={() => setShowCreateForm(true)}
            >
              + Create Assignment
            </button>
          )}
        </div>

        <div className="filter-section">
          <label htmlFor="course-filter">Filter by Course:</label>
          <select
            id="course-filter"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">All Courses</option>
            {batch.courses?.map(course => (
              <option key={course._id} value={course._id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Create Assignment Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Assignment</h2>
              <button
                className="close-btn"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="assignment-form">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="courseId">Course *</label>
                  <select
                    id="courseId"
                    value={newAssignment.courseId}
                    onChange={(e) => setNewAssignment({ ...newAssignment, courseId: e.target.value })}
                    required
                  >
                    <option value="">Select Course</option>
                    {batch.courses?.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="teacherId">Teacher *</label>
                  <select
                    id="teacherId"
                    value={newAssignment.teacherId}
                    onChange={(e) => setNewAssignment({ ...newAssignment, teacherId: e.target.value })}
                    required
                  >
                    <option value="">Select Teacher</option>
                    {batch.teachers?.map(teacher => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="dueDate">Due Date *</label>
                <input
                  type="datetime-local"
                  id="dueDate"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignments List */}
      <div className="assignments-list">
        {assignments.length === 0 ? (
          <div className="no-assignments">
            <p>No assignments found for this batch.</p>
            {selectedCourse && <p>Try removing the course filter.</p>}
          </div>
        ) : (
          assignments.map(assignment => (
            <div key={assignment._id} className={`assignment-card ${isOverdue(assignment.dueDate) ? 'overdue' : ''}`}>
              <div className="assignment-header">
                <h3>{assignment.title}</h3>
                <div className="assignment-meta">
                  <span className="course-name">
                    {assignment.course?.name}
                  </span>
                  <span className={`due-date ${isOverdue(assignment.dueDate) ? 'overdue' : ''}`}>
                    Due: {formatDate(assignment.dueDate)}
                  </span>
                </div>
              </div>

              {assignment.description && (
                <p className="assignment-description">{assignment.description}</p>
              )}

              <div className="assignment-footer">
                <span className="teacher-name">
                  By: {assignment.teacher?.name}
                </span>
                <div className="assignment-actions">
                  <button className="view-btn">View Details</button>
                  <button className="edit-btn">Edit</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default BatchAssignments
