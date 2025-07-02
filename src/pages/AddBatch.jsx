import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import '../styles/AddBatch.css';

const AddBatch = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch users and courses for future use (student/teacher assignment)
    const fetchData = async () => {
      try {
        await Promise.all([
          api.get('/users'),
          api.get('/courses')
        ]);
        // Data will be used in future updates for dropdowns
      } catch (error) {
        console.error('Error fetching data:', error);
        // Non-critical error, form can still work
      }
    };

    fetchData();
  }, []);

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

      await api.post('/batches', dataToSubmit);
      toast.success('Batch created successfully!');
      navigate('/batches');
    } catch (error) {
      console.error('Error creating batch:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create batch';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/batches');
  };

  return (
    <div className="add-batch-container">
      <div className="add-batch-header">
        <div className="header-content">
          <div>
            <h1>Add New Batch</h1>
            <p>Create a new student batch with schedule and enrollment details</p>
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
              <label htmlFor="isActiveBatch" className="batch-checkbox-label" id="isActiveBatchLabel">
                <input
                  type="checkbox"
                  id="isActiveBatch"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="form-checkbox"
                />
                <span className="batch-checkbox-custom" id="isActiveBatchCustom"></span>
                <div className="batch-checkbox-text">
                  <div>
                    <span className="label-icon">✅</span>
                    <strong>Active Batch</strong>
                  </div>
                  <p className="field-help">
                    Active batches are visible to students and can accept enrollments
                  </p>
                </div>
              </label>
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
                  Creating...
                </>
              ) : (
                <>
                  <span className="btn-icon">✅</span>
                  Create Batch
                </>
              )}
            </button>
          </div>
        </form>

        <div className="form-info">
          <div className="info-card">
            <h4>📋 Next Steps</h4>
            <ul>
              <li>After creating the batch, you can add students and teachers</li>
              <li>Assign courses to the batch from the batch details page</li>
              <li>Set up the weekly schedule for classes</li>
              <li>Configure room assignments and timings</li>
            </ul>
          </div>

          <div className="info-card">
            <h4>💡 Tips</h4>
            <ul>
              <li>Use descriptive names like "Web Development 2025" or "Data Science Fall 2024"</li>
              <li>Set realistic start and end dates</li>
              <li>You can modify these details later from the edit page</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBatch;
