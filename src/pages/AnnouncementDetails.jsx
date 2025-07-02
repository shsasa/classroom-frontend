import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getFileUrl } from '../services/api';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import '../styles/AnnouncementDetails.css';

const AnnouncementDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get user role from AuthContext
  const userRole = user?.role;
  const canEdit = ['admin', 'supervisor'].includes(userRole);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/announcements/${id}`);
        setAnnouncement(response.data);
      } catch (error) {
        console.error('Error fetching announcement:', error);
        toast.error('Failed to fetch announcement');
        navigate('/announcements');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      await api.delete(`/announcements/${id}`);
      toast.success('Announcement deleted successfully');
      navigate('/announcements');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="announcement-details-container">
        <div className="loading">Loading announcement...</div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="announcement-details-container">
        <div className="error">Announcement not found</div>
      </div>
    );
  }

  return (
    <div className="announcement-details-container">
      <div className="announcement-details-header">
        <button
          className="back-btn"
          onClick={() => navigate('/announcements')}
        >
          ← Back to Announcements
        </button>

        {canEdit && (
          <div className="header-actions">
            <button
              className="edit-btn"
              onClick={() => navigate(`/announcements/edit/${id}`)}
            >
              Edit
            </button>
            <button
              className="delete-btn"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="announcement-details-card">
        {announcement.isPinned && (
          <div className="pin-indicator">📌 Pinned Announcement</div>
        )}

        <div className="announcement-header">
          <h1 className="announcement-title">{announcement.title}</h1>

          <div className="announcement-meta">
            <div className="meta-row">
              <span className="meta-label">Published:</span>
              <span className="meta-value">{formatDate(announcement.createdAt)}</span>
            </div>

            {announcement.author && (
              <div className="meta-row">
                <span className="meta-label">Author:</span>
                <span className="meta-value">{announcement.author.name}</span>
              </div>
            )}

            {announcement.batch && (
              <div className="meta-row">
                <span className="meta-label">Target Batch:</span>
                <span className="meta-value">{announcement.batch.name}</span>
              </div>
            )}

            {announcement.course && (
              <div className="meta-row">
                <span className="meta-label">Target Course:</span>
                <span className="meta-value">{announcement.course.name}</span>
              </div>
            )}

            <div className="meta-row">
              <span className="meta-label">Status:</span>
              <span className={`status-badge ${announcement.isActive ? 'active' : 'inactive'}`}>
                {announcement.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="announcement-content">
          <h3>Content</h3>
          <div className="content-text">
            {announcement.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {announcement.attachments && announcement.attachments.length > 0 && (
          <div className="announcement-attachments">
            <h3>📎 Attachments</h3>
            <div className="attachments-list">
              {announcement.attachments.map((attachment, index) => {
                // Check if attachment is an object (new format) or string (old format)
                const isFileObject = typeof attachment === 'object' && attachment.filename;
                const fileName = isFileObject
                  ? attachment.originalName || attachment.filename
                  : attachment.split('/').pop() || `Attachment ${index + 1}`;
                const fileUrl = isFileObject
                  ? getFileUrl(attachment.filename)
                  : attachment;

                return (
                  <a
                    key={index}
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="attachment-link"
                  >
                    <span className="attachment-icon">📄</span>
                    <span className="attachment-name">{fileName}</span>
                    {isFileObject && attachment.size && (
                      <span className="attachment-size">({(attachment.size / 1024).toFixed(1)} KB)</span>
                    )}
                    <span className="external-icon">↗</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        <div className="announcement-timestamps">
          <div className="timestamp">
            <span className="timestamp-label">Created:</span>
            <span className="timestamp-value">{formatDate(announcement.createdAt)}</span>
          </div>
          {announcement.updatedAt !== announcement.createdAt && (
            <div className="timestamp">
              <span className="timestamp-label">Last Updated:</span>
              <span className="timestamp-value">{formatDate(announcement.updatedAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetails;
