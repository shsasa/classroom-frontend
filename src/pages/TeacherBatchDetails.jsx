import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import '../styles/BatchDetails.css';
import '../styles/TeacherBatchDetails.css';

const TeacherBatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    totalMarks: 100,
    courseId: ''
  });

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;
  const userRole = user.role;

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoadingAssignments(true);
        const response = await api.get(`/assignments?batchId=${id}`);
        setAssignments(response.data || []);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        toast.error('Failed to fetch assignments');
        setAssignments([]);
      } finally {
        setLoadingAssignments(false);
      }
    };

    const fetchBatchDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch batch details using the correct teacher-specific endpoint
        const batchResponse = await api.get(`/batches/teacher/${id}`);
        const batchData = batchResponse.data;
        setBatch(batchData);

        // Fetch assignments for this batch
        await fetchAssignments();

      } catch (error) {
        console.error('Error fetching batch details:', error);
        setError('Failed to fetch batch details');
        toast.error('Failed to fetch batch details');
      } finally {
        setLoading(false);
      }
    };

    fetchBatchDetails();
  }, [id, userId, userRole]);

  const fetchAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const response = await api.get(`/assignments?batchId=${id}`);
      setAssignments(response.data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to fetch assignments');
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();

    if (!newAssignment.title || !newAssignment.description || !newAssignment.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const assignmentData = {
        ...newAssignment,
        batchId: id,
        teacherId: userId,
        createdBy: userId
      };

      await api.post('/assignments', assignmentData);
      toast.success('Assignment created successfully');

      // Reset form and close modal
      setNewAssignment({
        title: '',
        description: '',
        dueDate: '',
        totalMarks: 100,
        courseId: ''
      });
      setShowCreateAssignmentModal(false);

      // Refresh assignments
      await fetchAssignments();

    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      await api.delete(`/assignments/${assignmentId}`);
      toast.success('Assignment deleted successfully');
      await fetchAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDueDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const isOverdue = date < now;
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return {
        formatted: formattedDate,
        isOverdue
      };
    } catch {
      return { formatted: 'Invalid Date', isOverdue: false };
    }
  };

  if (loading) {
    return (
      <div className="batch-details-container">
        <div className="loading">Loading batch details...</div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="batch-details-container">
        <div className="error">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Batch</h3>
          <p>{error || 'Batch not found'}</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/teacher/batches')}
          >
            Back to My Batches
          </button>
        </div>
      </div>
    );
  }

  const getBatchStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'upcoming';
    if (now > end) return 'completed';
    return 'active';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  const status = getBatchStatus(batch.startDate, batch.endDate);

  return (
    <div className="teacher-batch-details-container">
      {/* Header Section */}
      <div className="teacher-batch-header">
        <div className="header-content">
          <div className="header-main">
            <div className="header-info">
              <h1>
                <span className="teacher-icon">👨‍🏫</span>
                {batch.name}
              </h1>
              <div className="header-meta">
                <div className="batch-status">
                  <span className={`status-badge ${status}`}>
                    {getStatusText(status)}
                  </span>
                </div>
                <div className="batch-dates">
                  <span>{formatDate(batch.startDate)} - {formatDate(batch.endDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/teacher/batches')}
          >
            <span className="btn-icon">⬅️</span>
            Back to My Batches
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="teacher-batch-content">

        {/* Quick Stats */}
        <div className="teacher-stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-number">{batch.students?.length || 0}</div>
                <div className="stat-label">Students</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-info">
                <div className="stat-number">{assignments.length || 0}</div>
                <div className="stat-label">Assignments</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-info">
                <div className="stat-number">{batch.courses?.length || 0}</div>
                <div className="stat-label">Courses</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏰</div>
              <div className="stat-info">
                <div className="stat-number">{batch.schedule?.length || 0}</div>
                <div className="stat-label">Schedule Items</div>
              </div>
            </div>
          </div>
        </div>

        {/* Assignments Section - Main feature for teachers */}
        <div className="assignments-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">📝</span>
              Assignments Management
            </h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowCreateAssignmentModal(true)}
            >
              <span className="btn-icon">➕</span>
              Create New Assignment
            </button>
          </div>

          <div className="assignments-content">
            {loadingAssignments ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading assignments...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h4>No Assignments Yet</h4>
                <p>Create your first assignment to get started</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateAssignmentModal(true)}
                >
                  Create Assignment
                </button>
              </div>
            ) : (
              <div className="assignments-list">
                {assignments.map(assignment => {
                  const dueDate = formatDueDate(assignment.dueDate);
                  return (
                    <div key={assignment._id} className="assignment-card">
                      <div className="assignment-header">
                        <h4 className="assignment-title">{assignment.title}</h4>
                        <div className="assignment-actions">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => navigate(`/assignments/${assignment._id}`)}
                          >
                            View Details
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteAssignment(assignment._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="assignment-body">
                        <p className="assignment-description">{assignment.description}</p>
                        <div className="assignment-meta">
                          <div className="meta-item">
                            <span className="meta-label">Due Date:</span>
                            <span className={`meta-value ${dueDate.isOverdue ? 'overdue' : ''}`}>
                              {dueDate.formatted}
                              {dueDate.isOverdue && <span className="overdue-badge">Overdue</span>}
                            </span>
                          </div>
                          <div className="meta-item">
                            <span className="meta-label">Total Marks:</span>
                            <span className="meta-value">{assignment.totalMarks}</span>
                          </div>
                          {assignment.course && (
                            <div className="meta-item">
                              <span className="meta-label">Course:</span>
                              <span className="meta-value">{assignment.course.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Students Section */}
        <div className="students-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">👥</span>
              Students ({batch.students?.length || 0})
            </h3>
          </div>
          <div className="list-content">
            {batch.students && batch.students.length > 0 ? (
              <div className="students-grid">
                {batch.students.map(student => (
                  <div key={student._id || student} className="student-card">
                    <div className="student-avatar">👤</div>
                    <div className="student-info">
                      <span className="student-name">
                        {typeof student === 'object' ? student.name : 'Student'}
                      </span>
                      <span className="student-email">
                        {typeof student === 'object' ? student.email : 'No email'}
                      </span>
                    </div>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => {
                        const studentId = typeof student === 'object' ? student._id : student;
                        navigate(`/users/${studentId}`);
                      }}
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <p>No students enrolled yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Schedule Section */}
        <div className="schedule-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">⏰</span>
              Class Schedule
            </h3>
          </div>
          <div className="schedule-content">
            {batch.schedule && batch.schedule.length > 0 ? (
              <div className="schedule-grid">
                {batch.schedule.map((scheduleItem, index) => (
                  <div key={index} className="schedule-card">
                    <div className="schedule-day">{scheduleItem.day}</div>
                    <div className="schedule-time">
                      {scheduleItem.startTime} - {scheduleItem.endTime}
                    </div>
                    {scheduleItem.room && (
                      <div className="schedule-room">📍 {scheduleItem.room}</div>
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
      </div>

      {/* Create Assignment Modal */}
      {showCreateAssignmentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Assignment</h3>
              <button
                className="modal-close"
                onClick={() => setShowCreateAssignmentModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateAssignment} className="modal-body">
              <div className="form-group">
                <label htmlFor="title">Assignment Title *</label>
                <input
                  type="text"
                  id="title"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  placeholder="Enter assignment title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  placeholder="Enter assignment description"
                  rows={4}
                  required
                />
              </div>

              <div className="form-row">
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

                <div className="form-group">
                  <label htmlFor="totalMarks">Total Marks</label>
                  <input
                    type="number"
                    id="totalMarks"
                    value={newAssignment.totalMarks}
                    onChange={(e) => setNewAssignment({ ...newAssignment, totalMarks: parseInt(e.target.value) })}
                    min="1"
                    max="1000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="courseId">Course (Optional)</label>
                <select
                  id="courseId"
                  value={newAssignment.courseId}
                  onChange={(e) => setNewAssignment({ ...newAssignment, courseId: e.target.value })}
                >
                  <option value="">Select a course (optional)</option>
                  {batch.courses?.map(course => (
                    <option key={course._id || course} value={course._id || course}>
                      {typeof course === 'object' ? course.name : 'Course'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateAssignmentModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherBatchDetails;
