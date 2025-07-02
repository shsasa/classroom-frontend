import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import './AddCoursesToBatch.css';

const AddCoursesToBatch = ({ batchId, onClose, onCoursesAdded }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAvailableCourses = async () => {
      try {
        setLoading(true);
        // Get all courses
        const coursesResponse = await api.get('/courses');
        // Get current batch to check existing courses
        const batchResponse = await api.get(`/batches/${batchId}`);

        const allCourses = coursesResponse.data || [];
        const batchCourses = batchResponse.data.courses || [];

        // Filter out courses already in the batch
        const availableCourses = allCourses.filter(course =>
          !batchCourses.some(batchCourse =>
            (typeof batchCourse === 'object' ? batchCourse._id : batchCourse) === course._id
          )
        );

        setCourses(availableCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to fetch available courses');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableCourses();
  }, [batchId]);

  const handleCourseSelect = (courseId) => {
    setSelectedCourses(prev => {
      const isCurrentlySelected = prev.includes(courseId);
      return isCurrentlySelected
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId];
    });
  };

  const handleSelectAll = () => {
    const filteredCourses = getFilteredCourses();
    if (selectedCourses.length === filteredCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(filteredCourses.map(course => course._id));
    }
  };

  const handleSubmit = async () => {
    if (selectedCourses.length === 0) {
      toast.error('Please select at least one course');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/batches/${batchId}/courses`, {
        courseIds: selectedCourses
      });

      toast.success(`${selectedCourses.length} course(s) added successfully`);
      onCoursesAdded && onCoursesAdded();
      onClose();
    } catch (error) {
      console.error('Error adding courses:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add courses';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getFilteredCourses = () => {
    return courses.filter(course =>
      course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredCourses = getFilteredCourses();

  return (
    <div className="add-courses-modal">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add Courses to Batch</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Search and Controls */}
          <div className="search-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search courses by name or description..."
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
                disabled={filteredCourses.length === 0}
              >
                {selectedCourses.length === filteredCourses.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="selection-count">
                {selectedCourses.length} of {filteredCourses.length} selected
              </span>
            </div>
          </div>

          {/* Courses List */}
          <div className="courses-container">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading available courses...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h4>No Available Courses</h4>
                <p>
                  {searchTerm
                    ? 'No courses match your search criteria'
                    : 'All courses are already assigned to this batch'
                  }
                </p>
              </div>
            ) : (
              <div className="courses-list">
                {filteredCourses.map(course => (
                  <div
                    key={course._id}
                    className={`course-item ${selectedCourses.includes(course._id) ? 'selected' : ''}`}
                    onClick={() => handleCourseSelect(course._id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCourseSelect(course._id);
                      }
                    }}
                  >
                    <div className="course-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course._id)}
                        onChange={() => { }} // Handled by parent onClick
                        readOnly
                        tabIndex={-1}
                      />
                    </div>
                    <div className="course-icon">📚</div>
                    <div className="course-info">
                      <div className="course-name">{course.name || 'Unknown Course'}</div>
                      <div className="course-description">{course.description || 'No description'}</div>
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
            disabled={submitting || selectedCourses.length === 0}
          >
            {submitting ? (
              <>
                <span className="spinner-small"></span>
                Adding...
              </>
            ) : (
              `Add ${selectedCourses.length} Course${selectedCourses.length !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCoursesToBatch;
