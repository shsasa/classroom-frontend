import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './AddStudentsToBatch.css';

const AddStudentsToBatch = ({ batchId, onClose, onStudentsAdded }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAvailableStudents = async () => {
      try {
        setLoading(true);
        // Get all students
        const studentsResponse = await api.get('/users?role=student');
        // Get current batch to check existing students
        const batchResponse = await api.get(`/batches/${batchId}`);

        const allStudents = studentsResponse.data || [];
        const batchStudents = batchResponse.data.students || [];

        // Filter out students already in the batch
        const availableStudents = allStudents.filter(student =>
          !batchStudents.some(batchStudent =>
            (typeof batchStudent === 'object' ? batchStudent._id : batchStudent) === student._id
          )
        );

        setStudents(availableStudents);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to fetch available students');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableStudents();
  }, [batchId]);

  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => {
      const isCurrentlySelected = prev.includes(studentId);
      return isCurrentlySelected
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId];
    });
  };

  const handleSelectAll = () => {
    const filteredStudents = getFilteredStudents();
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student._id));
    }
  };

  const handleSubmit = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/batches/${batchId}/students`, {
        studentIds: selectedStudents
      });

      toast.success(`${selectedStudents.length} student(s) added successfully`);
      onStudentsAdded && onStudentsAdded();
      onClose();
    } catch (error) {
      console.error('Error adding students:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add students';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getFilteredStudents = () => {
    return students.filter(student =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredStudents = getFilteredStudents();

  return (
    <div className="add-students-modal">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add Students to Batch</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Search and Controls */}
          <div className="search-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search students by name or email..."
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
                disabled={filteredStudents.length === 0}
              >
                {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="selection-count">
                {selectedStudents.length} of {filteredStudents.length} selected
              </span>
            </div>
          </div>

          {/* Students List */}
          <div className="students-container">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading available students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h4>No Available Students</h4>
                <p>
                  {searchTerm
                    ? 'No students match your search criteria'
                    : 'All students are already enrolled in this batch'
                  }
                </p>
              </div>
            ) : (
              <div className="students-list">
                {filteredStudents.map(student => (
                  <div
                    key={student._id}
                    className={`student-item ${selectedStudents.includes(student._id) ? 'selected' : ''}`}
                    onClick={() => handleStudentSelect(student._id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleStudentSelect(student._id);
                      }
                    }}
                  >
                    <div className="student-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student._id)}
                        onChange={() => { }} // Handled by parent onClick
                        readOnly
                        tabIndex={-1}
                      />
                    </div>
                    <div className="student-avatar">
                      {student.name?.charAt(0)?.toUpperCase() || '👤'}
                    </div>
                    <div className="student-info">
                      <div className="student-name">{student.name || 'Unknown Student'}</div>
                      <div className="student-email">{student.email || 'No email'}</div>
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
            disabled={submitting || selectedStudents.length === 0}
          >
            {submitting ? (
              <>
                <span className="spinner-small"></span>
                Adding...
              </>
            ) : (
              `Add ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStudentsToBatch;
