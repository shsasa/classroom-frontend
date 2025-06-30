import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import '../styles/BatchDetails.css';

const BatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role;
  const canManageBatches = ['admin', 'supervisor'].includes(userRole);

  useEffect(() => {
    const fetchBatchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/batches/${id}`);
        setBatch(response.data);
      } catch (error) {
        console.error('Error fetching batch details:', error);
        setError('Failed to fetch batch details');
        toast.error('Failed to fetch batch details');
      } finally {
        setLoading(false);
      }
    };

    fetchBatchDetails();
  }, [id]);

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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this batch? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/batches/${id}`);
      toast.success('Batch deleted successfully');
      navigate('/batches');
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast.error('Failed to delete batch');
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
          <div className="error-icon">❌</div>
          <h3>Error Loading Batch</h3>
          <p>{error || 'Batch not found'}</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/batches')}
          >
            Back to Batches
          </button>
        </div>
      </div>
    );
  }

  const status = getBatchStatus(batch.startDate, batch.endDate);

  return (
    <div className="batch-details-container">
      {/* Header Section */}
      <div className="batch-header">
        <div className="header-content">
          <div className="header-main">
            <div className="header-icon">🎓</div>
            <div className="header-info">
              <h1>{batch.name}</h1>
              <div className="header-meta">
                <div className="batch-status">
                  <span className={`status-badge ${status}`}>
                    {getStatusText(status)}
                  </span>
                  {!batch.isActive && (
                    <span className="status-badge inactive">Inactive</span>
                  )}
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
            onClick={() => navigate('/batches')}
          >
            <span className="btn-icon">⬅️</span>
            Back to Batches
          </button>
          {canManageBatches && (
            <>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/batches/edit/${batch._id}`)}
              >
                <span className="btn-icon">✏️</span>
                Edit Batch
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
              >
                <span className="btn-icon">🗑️</span>
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="batch-content">
        {/* Basic Information */}
        <div className="content-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">📋</span>
              Basic Information
            </h3>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <label>Batch Name</label>
              <span>{batch.name}</span>
            </div>
            <div className="info-item">
              <label>Status</label>
              <span className={`status-badge ${status}`}>
                {getStatusText(status)}
              </span>
            </div>
            <div className="info-item">
              <label>Start Date</label>
              <span>{formatDate(batch.startDate)}</span>
            </div>
            <div className="info-item">
              <label>End Date</label>
              <span>{formatDate(batch.endDate)}</span>
            </div>
            <div className="info-item">
              <label>Active</label>
              <span className={batch.isActive ? 'text-success' : 'text-danger'}>
                {batch.isActive ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            {batch.description && (
              <div className="info-item full-width">
                <label>Description</label>
                <span>{batch.description}</span>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="content-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">📊</span>
              Statistics
            </h3>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-number">{batch.students?.length || 0}</div>
                <div className="stat-label">Students</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👨‍🏫</div>
              <div className="stat-info">
                <div className="stat-number">{batch.teachers?.length || 0}</div>
                <div className="stat-label">Teachers</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👨‍💼</div>
              <div className="stat-info">
                <div className="stat-number">{batch.supervisors?.length || 0}</div>
                <div className="stat-label">Supervisors</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-info">
                <div className="stat-number">{batch.courses?.length || 0}</div>
                <div className="stat-label">Courses</div>
              </div>
            </div>
          </div>
        </div>

        {/* Students Section */}
        <div className="content-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">👥</span>
              Students ({batch.students?.length || 0})
            </h3>
            {canManageBatches && (
              <button className="btn btn-secondary btn-sm">
                <span className="btn-icon">➕</span>
                Add Students
              </button>
            )}
          </div>
          <div className="list-content">
            {batch.students && batch.students.length > 0 ? (
              <div className="users-list">
                {batch.students.map(student => (
                  <div key={student._id || student} className="user-item">
                    <div className="user-avatar">👤</div>
                    <div className="user-info">
                      <span className="user-name">
                        {typeof student === 'object' ? student.name : 'Student'}
                      </span>
                      <span className="user-role">Student</span>
                    </div>
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

        {/* Teachers Section */}
        <div className="content-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">👨‍🏫</span>
              Teachers ({batch.teachers?.length || 0})
            </h3>
            {canManageBatches && (
              <button className="btn btn-secondary btn-sm">
                <span className="btn-icon">➕</span>
                Add Teachers
              </button>
            )}
          </div>
          <div className="list-content">
            {batch.teachers && batch.teachers.length > 0 ? (
              <div className="users-list">
                {batch.teachers.map(teacher => (
                  <div key={teacher._id || teacher} className="user-item">
                    <div className="user-avatar">👨‍🏫</div>
                    <div className="user-info">
                      <span className="user-name">
                        {typeof teacher === 'object' ? teacher.name : 'Teacher'}
                      </span>
                      <span className="user-role">Teacher</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">👨‍🏫</div>
                <p>No teachers assigned yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Courses Section */}
        <div className="content-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">📚</span>
              Courses ({batch.courses?.length || 0})
            </h3>
            {canManageBatches && (
              <button className="btn btn-secondary btn-sm">
                <span className="btn-icon">➕</span>
                Add Courses
              </button>
            )}
          </div>
          <div className="list-content">
            {batch.courses && batch.courses.length > 0 ? (
              <div className="courses-list">
                {batch.courses.map(course => (
                  <div key={course._id || course} className="course-item">
                    <div className="course-icon">📚</div>
                    <div className="course-info">
                      <span className="course-name">
                        {typeof course === 'object' ? course.name : 'Course'}
                      </span>
                      <span className="course-desc">
                        {typeof course === 'object' ? course.description : 'Course Description'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <p>No courses assigned yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Schedule Section */}
        <div className="content-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">⏰</span>
              Schedule
            </h3>
            {canManageBatches && (
              <button className="btn btn-secondary btn-sm">
                <span className="btn-icon">✏️</span>
                Edit Schedule
              </button>
            )}
          </div>
          <div className="list-content">
            {batch.schedule && batch.schedule.length > 0 ? (
              <div className="schedule-list">
                {batch.schedule.map((scheduleItem, index) => (
                  <div key={index} className="schedule-item">
                    <div className="schedule-day">{scheduleItem.day}</div>
                    <div className="schedule-time">
                      {scheduleItem.startTime} - {scheduleItem.endTime}
                    </div>
                    {scheduleItem.room && (
                      <div className="schedule-room">Room: {scheduleItem.room}</div>
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
    </div>
  );
};

export default BatchDetails;
