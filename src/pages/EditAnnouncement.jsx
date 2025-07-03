import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import '../styles/AddAnnouncement.css';
import '../styles/AnnouncementCheckbox.css';
import '../styles/SharedComponents.css';

const EditAnnouncement = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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
  const [existingAttachments, setExistingAttachments] = useState([]);

  // Get user role from AuthContext
  const userRole = user?.role;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setFetching(true);
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login first');
          navigate('/signin');
          return;
        }

        // First check if the announcement exists
        let announcement;
        try {
          const announcementResponse = await api.get(`/announcements/${id}`);
          announcement = announcementResponse.data;
        } catch (announcementError) {
          throw new Error(`Announcement not found: ${announcementError.message}`);
        }        // Then fetch other data
        const filterDataResponse = await api.get('/announcements/filter-data');

        // All data fetched successfully

        setFormData({
          title: announcement.title || '',
          content: announcement.content || '',
          batch: announcement.batch?._id || '',
          course: announcement.course?._id || '',
          isPinned: announcement.isPinned || false,
          isActive: announcement.isActive !== false,
          attachments: []
        });

        // Store existing attachments separately
        setExistingAttachments(announcement.attachments || []);

        setBatches(filterDataResponse.data.batches);
        setCourses(filterDataResponse.data.courses);
      } catch (error) {
        console.error('❌ Error in fetchInitialData:', error);
        toast.error(`Failed to load announcement: ${error.message}`);
        navigate('/announcements');
      } finally {
        setFetching(false);
      }
    };

    if (!id) {
      console.error('❌ No announcement ID provided');
      toast.error('No announcement ID provided');
      navigate('/announcements');
      return;
    }

    fetchInitialData();
  }, [id, navigate]);

  // Check permission
  if (!['admin', 'supervisor'].includes(userRole)) {
    return (
      <div className="add-announcement-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to edit announcements.</p>
          <button onClick={() => navigate('/announcements')} className="back-btn">
            Back to Announcements
          </button>
        </div>
      </div>
    );
  }

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
  };

  const removeAttachment = (index, isExisting = true) => {
    if (isExisting) {
      setExistingAttachments(prev => prev.filter((_, i) => i !== index));
    } else {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    }
  }; const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Content is required');
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const updateData = new FormData();
      updateData.append('title', formData.title.trim());
      updateData.append('content', formData.content.trim());
      updateData.append('batch', formData.batch && formData.batch.trim() ? formData.batch.trim() : '');
      updateData.append('course', formData.course && formData.course.trim() ? formData.course.trim() : '');
      updateData.append('isPinned', formData.isPinned.toString());
      updateData.append('isActive', formData.isActive.toString());

      // Add existing attachments as JSON
      updateData.append('existingAttachments', JSON.stringify(existingAttachments));

      // Add new files to FormData
      selectedFiles.forEach((file) => {
        updateData.append('attachments', file);
      });

      // Update data ready to be sent

      const response = await api.put(`/announcements/${id}`, updateData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Announcement updated successfully
      toast.success('Announcement updated successfully!');
      navigate('/announcements');
    } catch (error) {
      console.error('Error updating announcement:', error);
      if (error.response?.data?.msg) {
        toast.error(error.response.data.msg);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update announcement');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="add-announcement-container">
        <div className="add-announcement-card">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading announcement data...</p>
            <small>ID: {id}</small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-announcement-container">
      <div className="add-announcement-card">
        <div className="add-announcement-header">
          <h2>Edit Announcement</h2>
          <p>Update the announcement details below</p>
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
              maxLength={200}
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
              required
              rows={6}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="batch">Target Batch</label>
              <select
                id="batch"
                name="batch"
                value={formData.batch}
                onChange={handleInputChange}
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
              <label htmlFor="course">Target Course</label>
              <select
                id="course"
                name="course"
                value={formData.course}
                onChange={handleInputChange}
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

              {/* Show existing attachments */}
              {existingAttachments.length > 0 && (
                <div className="attachments-list">
                  <h4>Current Attachments:</h4>
                  {existingAttachments.map((attachment, index) => (
                    <div key={index} className="attachment-item">
                      <span className="attachment-name">
                        {attachment.originalName || attachment.filename || `Attachment ${index + 1}`}
                      </span>
                      {attachment.size && (
                        <span className="attachment-size">({(attachment.size / 1024).toFixed(1)} KB)</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeAttachment(index, true)}
                        className="remove-attachment-btn"
                        disabled={loading}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Show new selected files */}
              {selectedFiles.length > 0 && (
                <div className="attachments-list">
                  <h4>New Files to Upload:</h4>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="attachment-item">
                      <span className="attachment-name">{file.name}</span>
                      <span className="attachment-size">({(file.size / 1024).toFixed(1)} KB)</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index, false)}
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

          <div className="form-row">
            <div className="form-group checkbox-container-shared">
              <label className="checkbox-label-shared">
                <input
                  type="checkbox"
                  name="isPinned"
                  checked={formData.isPinned}
                  onChange={handleInputChange}
                />
                <span className="checkbox-mark-shared"></span>
                Pin this announcement
              </label>
              <small className="checkbox-description-shared">Pinned announcements appear at the top of the list</small>
            </div>

            <div className="form-group checkbox-container-shared">
              <label className="checkbox-label-shared">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <span className="checkbox-mark-shared"></span>
                Active announcement
              </label>
              <small className="checkbox-description-shared">Only active announcements are visible to users</small>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/announcements')}
              className="btn-cancel-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner small"></span>
                  Updating...
                </>
              ) : (
                'Update Announcement'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAnnouncement;
