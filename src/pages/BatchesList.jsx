import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import '../styles/BatchesList.css';

const BatchesList = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role;
  const canManageBatches = ['admin', 'supervisor'].includes(userRole);

  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/batches');
      setBatches(response.data || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
      setError('Failed to fetch batches');
      toast.error('Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) {
      return;
    }

    try {
      await api.delete(`/batches/${id}`);
      toast.success('Batch deleted successfully');
      fetchBatches(); // Refresh the list
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast.error('Failed to delete batch');
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
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

  if (loading) {
    return (
      <div className="batches-container">
        <div className="loading">Loading batches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="batches-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="batches-container">
      <div className="batches-header">
        <div className="header-content">
          <h1>Batches Management</h1>
          <p>Manage student batches, schedules, and enrollments</p>
        </div>
        {canManageBatches && (
          <button
            className="add-batch-btn"
            onClick={() => navigate('/batches/add')}
          >
            <span className="btn-icon">➕</span>
            Add New Batch
          </button>
        )}
      </div>

      {batches.length === 0 ? (
        <div className="no-batches">
          <div className="empty-icon">🎓</div>
          <h3>No Batches Found</h3>
          <p>There are no batches created yet.</p>
          {canManageBatches && (
            <button
              className="add-first-batch-btn"
              onClick={() => navigate('/batches/add')}
            >
              Create First Batch
            </button>
          )}
        </div>
      ) : (
        <div className="batches-grid">
          {batches.map(batch => {
            const status = getBatchStatus(batch.startDate, batch.endDate);

            return (
              <div
                key={batch._id}
                className={`batch-card ${status} ${!batch.isActive ? 'inactive' : ''}`}
              >
                <div className="batch-header">
                  <h3 className="batch-name">{batch.name}</h3>
                  <div className="batch-status">
                    <span className={`status-badge ${status}`}>
                      {getStatusText(status)}
                    </span>
                    {!batch.isActive && (
                      <span className="status-badge inactive">Inactive</span>
                    )}
                  </div>
                </div>

                {batch.description && (
                  <div className="batch-description">
                    <p>{batch.description}</p>
                  </div>
                )}

                <div className="batch-dates">
                  <div className="date-item">
                    <span className="date-icon">🗓️</span>
                    <span className="date-label">Start:</span>
                    <span className="date-value">{formatDate(batch.startDate)}</span>
                  </div>
                  <div className="date-item">
                    <span className="date-icon">🏁</span>
                    <span className="date-label">End:</span>
                    <span className="date-value">{formatDate(batch.endDate)}</span>
                  </div>
                </div>

                <div className="batch-stats">
                  <div className="stat-item">
                    <span className="stat-icon">👥</span>
                    <span className="stat-label">Students:</span>
                    <span className="stat-value">{batch.students?.length || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">👨‍🏫</span>
                    <span className="stat-label">Teachers:</span>
                    <span className="stat-value">{batch.teachers?.length || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">📚</span>
                    <span className="stat-label">Courses:</span>
                    <span className="stat-value">{batch.courses?.length || 0}</span>
                  </div>
                </div>

                <div className="batch-actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => navigate(`/batches/${batch._id}`)}
                  >
                    <span className="btn-icon">👁️</span>
                    View Details
                  </button>
                  {canManageBatches && (
                    <>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => navigate(`/batches/edit/${batch._id}`)}
                      >
                        <span className="btn-icon">✏️</span>
                        Edit
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(batch._id)}
                      >
                        <span className="btn-icon">🗑️</span>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BatchesList;
