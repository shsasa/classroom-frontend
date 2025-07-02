import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './AddTeachersToBatch.css';

const AddTeachersToBatch = ({ batchId, onClose, onTeachersAdded }) => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAvailableTeachers = async () => {
      try {
        setLoading(true);
        // Get all teachers
        const teachersResponse = await api.get('/users?role=teacher');
        // Get current batch to check existing teachers
        const batchResponse = await api.get(`/batches/${batchId}`);

        const allTeachers = teachersResponse.data || [];
        const batchTeachers = batchResponse.data.teachers || [];

        // Filter out teachers already in the batch
        const availableTeachers = allTeachers.filter(teacher =>
          !batchTeachers.some(batchTeacher =>
            (typeof batchTeacher === 'object' ? batchTeacher._id : batchTeacher) === teacher._id
          )
        );

        setTeachers(availableTeachers);
      } catch (error) {
        console.error('Error fetching teachers:', error);
        toast.error('Failed to fetch available teachers');
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableTeachers();
  }, [batchId]);

  const handleTeacherSelect = (teacherId) => {
    setSelectedTeachers(prev => {
      const isCurrentlySelected = prev.includes(teacherId);
      return isCurrentlySelected
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId];
    });
  };

  const handleSelectAll = () => {
    const filteredTeachers = getFilteredTeachers();
    if (selectedTeachers.length === filteredTeachers.length) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(filteredTeachers.map(teacher => teacher._id));
    }
  };

  const handleSubmit = async () => {
    if (selectedTeachers.length === 0) {
      toast.error('Please select at least one teacher');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/batches/${batchId}/teachers`, {
        teacherIds: selectedTeachers
      });

      toast.success(`${selectedTeachers.length} teacher(s) added successfully`);
      onTeachersAdded && onTeachersAdded();
      onClose();
    } catch (error) {
      console.error('Error adding teachers:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add teachers';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getFilteredTeachers = () => {
    return teachers.filter(teacher =>
      teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredTeachers = getFilteredTeachers();

  return (
    <div className="add-teachers-modal">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add Teachers to Batch</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Search and Controls */}
          <div className="search-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search teachers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="selection-controls">
              <button
                type="button"
                onClick={handleSelectAll}
                className="btn btn-outline"
                disabled={filteredTeachers.length === 0}
              >
                {selectedTeachers.length === filteredTeachers.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="selection-count">
                {selectedTeachers.length} of {filteredTeachers.length} selected
              </span>
            </div>
          </div>

          {/* Teachers List */}
          <div className="teachers-container">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading available teachers...</p>
              </div>
            ) : filteredTeachers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👨‍🏫</div>
                <h4>No Available Teachers</h4>
                <p>
                  {searchTerm
                    ? 'No teachers match your search criteria'
                    : 'All teachers are already assigned to this batch'
                  }
                </p>
              </div>
            ) : (
              <div className="teachers-list">
                {filteredTeachers.map(teacher => (
                  <div
                    key={teacher._id}
                    className={`teacher-item ${selectedTeachers.includes(teacher._id) ? 'selected' : ''}`}
                    onClick={() => handleTeacherSelect(teacher._id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleTeacherSelect(teacher._id);
                      }
                    }}
                  >
                    <div className="teacher-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedTeachers.includes(teacher._id)}
                        onChange={() => { }} // Handled by parent onClick
                        readOnly
                        tabIndex={-1}
                      />
                    </div>
                    <div className="teacher-avatar">
                      {teacher.name?.charAt(0)?.toUpperCase() || '👨‍🏫'}
                    </div>
                    <div className="teacher-info">
                      <div className="teacher-name">{teacher.name || 'Unknown Teacher'}</div>
                      <div className="teacher-email">{teacher.email || 'No email'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={submitting || selectedTeachers.length === 0}
          >
            {submitting ? (
              <>
                <span className="spinner-small"></span>
                Adding...
              </>
            ) : (
              `Add ${selectedTeachers.length} Teacher${selectedTeachers.length !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTeachersToBatch;
