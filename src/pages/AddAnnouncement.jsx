import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import '../styles/AddAnnouncement.css';
import '../styles/AnnouncementCheckbox.css';
import '../styles/SharedComponents.css';

const AddAnnouncement = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    batch: '',
    course: '',
    isPinned: false,
    isActive: true,
    attachments: []
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Get user role from AuthContext
  const userRole = user?.role;

  useEffect(() => {
    fetchBatchesAndCourses();
  }, []);

  // Check permission
  if (!['admin', 'supervisor'].includes(userRole)) {
    return (
      <div className="add-announcement-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to create announcements.</p>
          <button onClick={() => navigate('/announcements')} className="back-btn">
            Back to Announcements
          </button>
        </div>
      </div>
    );
  }

  const fetchBatchesAndCourses = async () => {
    try {
      const filterDataResponse = await api.get('/announcements/filter-data');
      setBatches(filterDataResponse.data.batches);
      setCourses(filterDataResponse.data.courses);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load form data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    // Update formData to show file names for display
    setFormData(prev => ({
      ...prev,
      attachments: files.map(file => file.name)
    }));
  };

  const handleFileRemove = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);

    setFormData(prev => ({
      ...prev,
      attachments: updatedFiles.map(file => file.name)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('content', formData.content.trim());
      submitData.append('batch', formData.batch && formData.batch.trim() ? formData.batch.trim() : '');
      submitData.append('course', formData.course && formData.course.trim() ? formData.course.trim() : '');
      submitData.append('isPinned', formData.isPinned.toString());
      submitData.append('isActive', formData.isActive.toString());

      // Add files to FormData
      selectedFiles.forEach((file) => {
        submitData.append('attachments', file);
      });

      await api.post('/announcements', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Announcement created successfully!');
      navigate('/announcements');
    } catch (error) {
      console.error('Error creating announcement:', error);
      if (error.response?.data?.msg) {
        toast.error(error.response.data.msg);
      } else {
        toast.error('Failed to create announcement. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      navigate('/announcements');
    }
  };

  return (
    <div className="add-announcement-container">
      <div className="add-announcement-card">
        <div className="add-announcement-header">
          <h2>Create New Announcement</h2>
          <p>Share important information with students and staff</p>
        </div>

        <form onSubmit={handleSubmit} className="add-announcement-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter announcement title"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Enter announcement content"
              rows="6"
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="batch">Target Batch (Optional)</label>
              <select
                id="batch"
                name="batch"
                value={formData.batch}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="">All Batches</option>
                {batches.map(batch => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="course">Target Course (Optional)</label>
              <select
                id="course"
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="attachments">Attachments</label>
            <div className="attachments-section">
              <input
                type="file"
                id="attachments"
                name="attachments"
                onChange={handleFileChange}
                multiple
                disabled={loading}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.zip,.rar"
                className="file-input"
              />

              {selectedFiles.length > 0 && (
                <div className="attachments-list">
                  <h4>Selected Files:</h4>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="attachment-item">
                      <span className="attachment-name">{file.name}</span>
                      <span className="attachment-size">({(file.size / 1024).toFixed(1)} KB)</span>
                      <button
                        type="button"
                        onClick={() => handleFileRemove(index)}
                        className="remove-attachment-btn"
                        disabled={loading}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <small className="file-help-text">
                Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF, TXT, ZIP, RAR (Max 5 files)
              </small>
            </div>
          </div>

          <div className="form-options">
            <div className="checkbox-container-shared">
              <label className="checkbox-label-shared" htmlFor="isPinned">
                <input
                  type="checkbox"
                  id="isPinned"
                  name="isPinned"
                  checked={formData.isPinned}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <span className="checkbox-mark-shared"></span>
                Pin this announcement
              </label>
              <small className="checkbox-description-shared">Pinned announcements appear at the top of the list</small>
            </div>

            <div className="checkbox-container-shared">
              <label className="checkbox-label-shared" htmlFor="isActive">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <span className="checkbox-mark-shared"></span>
                Active announcement
              </label>
              <small className="checkbox-description-shared">Only active announcements are visible to users</small>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-submit-primary"
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
            >
              {loading ? 'Creating...' : 'Create Announcement'}
            </button>
            <button
              type="button"
              className="btn-cancel-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAnnouncement;
