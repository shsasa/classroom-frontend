import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import '../styles/AddBatch.css'; // نستخدم نفس تصميم AddBatch

const EditBatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBatchData = async () => {
      try {
        setInitialLoading(true);
        setError(null);
        const response = await api.get(`/batches/${id}`);
        const batch = response.data;

        setFormData({
          name: batch.name || '',
          description: batch.description || '',
          startDate: batch.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : '',
          endDate: batch.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : '',
          isActive: batch.isActive !== undefined ? batch.isActive : true
        });
      } catch (error) {
        console.error('Error fetching batch:', error);
        setError('Failed to fetch batch data');
        toast.error('Failed to fetch batch data');
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      fetchBatchData();
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Batch name is required');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error('Start date and end date are required');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      setLoading(true);
      const dataToSubmit = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim()
      };

      await api.put(`/batches/${id}`, dataToSubmit);
      toast.success('Batch updated successfully!');
      navigate(`/batches/${id}`);
    } catch (error) {
      console.error('Error updating batch:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update batch';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/batches/${id}`);
  };

  if (initialLoading) {
    return (
      <div className="add-batch-container">
        <div className="loading">Loading batch data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="add-batch-container">
        <div className="error">
          <div className="error-icon">❌</div>
          <h3>Error Loading Batch</h3>
          <p>{error}</p>
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

  return (
    <div className="add-batch-container">
      <div className="add-batch-header">
        <div className="header-content">
          <div className="header-icon">✏️</div>
          <div>
            <h1>Edit Batch</h1>
            <p>Update batch information and settings</p>
          </div>
        </div>
      </div>

      <div className="add-batch-content">
        <form onSubmit={handleSubmit} className="batch-form">
          <div className="form-section">
            <h3>Basic Information</h3>

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                <span className="label-icon">📝</span>
                Batch Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Batch 2025, Summer 2024"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                <span className="label-icon">📄</span>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the batch"
                className="form-textarea"
                rows={3}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Schedule</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate" className="form-label">
                  <span className="label-icon">🗓️</span>
                  Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate" className="form-label">
                  <span className="label-icon">🏁</span>
                  End Date *
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Settings</h3>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="form-checkbox"
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">
                  <span className="label-icon">✅</span>
                  Active Batch
                </span>
              </label>
              <p className="field-help">
                Active batches are visible to students and can accept enrollments
              </p>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-icon">⏳</span>
                  Updating...
                </>
              ) : (
                <>
                  <span className="btn-icon">💾</span>
                  Update Batch
                </>
              )}
            </button>
          </div>
        </form>

        <div className="form-info">
          <div className="info-card">
            <h4>💡 Edit Tips</h4>
            <ul>
              <li>Changes will be applied immediately after saving</li>
              <li>Students and teachers will be notified of major changes</li>
              <li>Schedule changes may affect ongoing classes</li>
              <li>You can manage students, teachers, and courses from the batch details page</li>
            </ul>
          </div>

          <div className="info-card">
            <h4>⚠️ Important Notes</h4>
            <ul>
              <li>Changing dates may affect attendance records</li>
              <li>Deactivating a batch will hide it from students</li>
              <li>Make sure to coordinate changes with teachers and supervisors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBatch;
