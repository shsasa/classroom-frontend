import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getFileUrl } from '../services/api';
import { toast } from 'react-toastify';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/AnnouncementsList.css';

const AnnouncementsList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    batch: '',
    course: ''
  });
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  // Get user role from localStorage with error handling
  let user = {};
  let userRole = '';
  let canCreateAnnouncement = false;

  try {
    const userString = localStorage.getItem('user');
    user = userString ? JSON.parse(userString) : {};
    userRole = user.role || '';
    canCreateAnnouncement = ['admin', 'supervisor'].includes(userRole);
  } catch (error) {
    console.error('❌ Error parsing user data from localStorage:', error);
    user = {};
    userRole = '';
    canCreateAnnouncement = false;
  }

  const fetchAnnouncements = useCallback(async () => {
    try {
      console.log('🔄 Fetching announcements with filters:', filters);
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.batch) queryParams.append('batch', filters.batch);
      if (filters.course) queryParams.append('course', filters.course);

      const response = await api.get(`/announcements?${queryParams}`);
      console.log('📋 Announcements response:', response.data);

      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        setAnnouncements(response.data);
        console.log('✅ Announcements loaded successfully:', response.data.length);
      } else {
        console.error('❌ Invalid announcements data format:', response.data);
        setAnnouncements([]);
        toast.error('Invalid data format received from server');
      }
    } catch (error) {
      console.error('❌ Error fetching announcements:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setAnnouncements([]); // Reset to empty array on error
      toast.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('🔄 Loading initial filter data...');
        // Use the new filter-data endpoint instead of separate calls
        const [filterDataResponse] = await Promise.all([
          api.get('/announcements/filter-data')
        ]);

        console.log('📊 Filter data response:', filterDataResponse.data);

        // Ensure batches and courses are arrays with better error handling
        const batchesData = filterDataResponse?.data?.batches;
        const coursesData = filterDataResponse?.data?.courses;

        setBatches(Array.isArray(batchesData) ? batchesData : []);
        setCourses(Array.isArray(coursesData) ? coursesData : []);

        console.log('✅ Filter data loaded successfully');
      } catch (error) {
        console.error('❌ Error fetching initial data:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        setBatches([]);
        setCourses([]);
        toast.error('Failed to load filter data. Please refresh the page.');
      }
    };

    loadInitialData();
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchAnnouncements();
  };

  const clearFilters = () => {
    setFilters({ search: '', batch: '', course: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      await api.delete(`/announcements/${id}`);
      toast.success('Announcement deleted successfully');
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) {
        return 'No date';
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('⚠️ Invalid date string:', dateString);
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('❌ Error formatting date:', error, 'dateString:', dateString);
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="announcements-container">
        <div className="loading">Loading announcements...</div>
      </div>
    );
  } return (
    <ErrorBoundary>
      <div className="announcements-container">
        <div className="announcements-header">
          <div className="header-content">
            <div className="header-icon">📢</div>
            <h1>Announcements</h1>
            <p>Stay updated with the latest news and important updates</p>
          </div>
          {canCreateAnnouncement && (
            <button
              className="add-announcement-btn"
              onClick={() => navigate('/announcements/add')}
            >
              <span className="btn-icon">✏️</span>
              Add New Announcement
            </button>
          )}
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filters-header">
            <h3>🔍 Filter Announcements</h3>
          </div>
          <div className="filters-grid">
            <div className="filter-group">
              <label>🔍 Search</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search announcements..."
                className="search-input"
              />
            </div>
            <div className="filter-group">
              <label>📚 Batch</label>
              <select
                name="batch"
                value={filters.batch}
                onChange={handleFilterChange}
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
              <label>🎓 Course</label>
              <select
                name="course"
                value={filters.course}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-actions">
              <button className="apply-btn" onClick={applyFilters}>
                Apply Filters
              </button>
              <button className="clear-btn" onClick={clearFilters}>
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Announcements List */}
        {!Array.isArray(announcements) || announcements.length === 0 ? (
          <div className="no-announcements">
            <div className="empty-icon">📭</div>
            <h3>No Announcements Found</h3>
            <p>There are no announcements matching your search criteria.</p>
            {canCreateAnnouncement && (
              <button
                className="add-first-announcement-btn"
                onClick={() => navigate('/announcements/add')}
              >
                Create First Announcement
              </button>
            )}
          </div>
        ) : (
          <div className="announcements-grid">
            {announcements.map((announcement, index) => {
              // Safety check for announcement object
              if (!announcement || !announcement._id) {
                console.warn(`⚠️ Invalid announcement at index ${index}:`, announcement);
                return null;
              }

              try {
                return (
                  <div
                    key={announcement._id}
                    className={`announcement-card ${announcement.isPinned ? 'pinned' : ''}`}
                  >
                    {announcement.isPinned && (
                      <div className="pin-indicator">📌 Pinned</div>
                    )}

                    <div className="announcement-header">
                      <h3 className="announcement-title">{announcement.title || 'Untitled'}</h3>
                      <div className="announcement-meta">
                        <div className="meta-item">
                          <span className="meta-icon">📅</span>
                          <span className="announcement-date">
                            {formatDate(announcement.createdAt)}
                          </span>
                        </div>
                        {announcement.author && (
                          <div className="meta-item">
                            <span className="meta-icon">👤</span>
                            <span className="author-name">{announcement.author.name || 'Unknown Author'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="announcement-content">
                      <p>{announcement.content || 'No content available'}</p>
                    </div>

                    {announcement.attachments && announcement.attachments.length > 0 && (
                      <div className="announcement-attachments">
                        <h4>📎 Attachments:</h4>
                        <div className="attachments-list">
                          {announcement.attachments.map((attachment, index) => {
                            // Handle both file objects (new format) and URL strings (old format)
                            const isFileObject = typeof attachment === 'object' && attachment.filename;
                            const fileName = isFileObject
                              ? attachment.originalName || attachment.filename
                              : attachment.split('/').pop();
                            const fileUrl = isFileObject
                              ? getFileUrl(attachment.filename)
                              : attachment;

                            return (
                              <div key={index} className="attachment-item">
                                <span className="attachment-icon">📄</span>
                                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                  {fileName}
                                </a>
                                {isFileObject && attachment.size && (
                                  <span className="attachment-size">
                                    ({(attachment.size / 1024).toFixed(1)} KB)
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="announcement-footer">
                      <div className="announcement-stats">
                        <span className="status-badge active">Active</span>
                      </div>

                      <div className="announcement-actions">
                        <button
                          className="action-btn view-btn"
                          onClick={() => navigate(`/announcements/${announcement._id}`)}
                        >
                          <span className="btn-icon">👁️</span>
                          View
                        </button>
                        {canCreateAnnouncement && (
                          <>
                            <button
                              className="action-btn edit-btn"
                              onClick={() => navigate(`/announcements/edit/${announcement._id}`)}
                            >
                              <span className="btn-icon">✏️</span>
                              Edit
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDelete(announcement._id)}
                            >
                              <span className="btn-icon">🗑️</span>
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              } catch (error) {
                console.error(`❌ Error rendering announcement ${announcement._id}:`, error);
                return null;
              }
            }).filter(Boolean)} {/* Filter out null values */}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default AnnouncementsList;
