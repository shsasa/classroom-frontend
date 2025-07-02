import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { getTeacherBatches, getBatchCourses } from '../services/batches'
import { CreateAssignment } from '../services/AssignmentService'
import '../styles/CreateAssignment.css'

const CreateAssignmentPage = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [batches, setBatches] = useState([])
  const [courses, setCourses] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    batchId: '',
    courseId: '',
    dueDate: '',
    instructions: '',
    maxScore: 100,
    submissionType: 'text'
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchTeacherBatches()
  }, [])

  const fetchTeacherBatches = async () => {
    try {
      const response = await getTeacherBatches()
      // Filter only active batches that haven't ended
      const activeBatches = (response || []).filter(batch => {
        const now = new Date()
        const startDate = batch.startDate ? new Date(batch.startDate) : null
        const endDate = batch.endDate ? new Date(batch.endDate) : null

        return (
          batch.isActive === true && // Must be marked as active
          (!endDate || endDate > now) && // End date hasn't passed (if exists)
          (!startDate || startDate <= now) // Batch has started or starts today
        )
      })
      setBatches(activeBatches)
      console.log('Active batches loaded:', activeBatches.length)
    } catch (error) {
      console.error('Error fetching teacher batches:', error)
      setBatches([])
    }
  }

  const fetchBatchCourses = async (batchId) => {
    try {
      const response = await getBatchCourses(batchId)
      setCourses(response || [])
      // Reset course selection when batch changes
      setFormData(prev => ({
        ...prev,
        courseId: ''
      }))
    } catch (error) {
      console.error('Error fetching batch courses:', error)
      setCourses([])
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // If batch is changed, fetch courses for that batch
    if (name === 'batchId' && value) {
      fetchBatchCourses(value)
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Assignment title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Assignment description is required'
    }

    if (!formData.batchId) {
      newErrors.batchId = 'Please select a batch'
    }

    if (!formData.courseId) {
      newErrors.courseId = 'Please select a course'
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required'
    } else {
      const dueDate = new Date(formData.dueDate)
      const now = new Date()
      if (dueDate <= now) {
        newErrors.dueDate = 'Due date must be in the future'
      }
    }

    if (formData.maxScore <= 0) {
      newErrors.maxScore = 'Maximum score must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const assignmentData = {
        ...formData,
        teacherId: user.id,
        createdBy: user.id
      }

      await CreateAssignment(assignmentData)
      navigate('/teacher/assignments')
    } catch (error) {
      console.error('Error creating assignment:', error)
      setErrors({ submit: 'Failed to create assignment. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-assignment-container">
      <div className="create-assignment-header">
        <div className="header-content">
          <h1>Create New Assignment</h1>
          <p>Create and manage assignments for your courses</p>
        </div>
        <button
          type="button"
          className="create-assignment-btn create-assignment-btn-secondary"
          onClick={() => navigate('/teacher/assignments')}
        >
          <i className="fas fa-arrow-left"></i> Back to Assignments
        </button>
      </div>

      <div className="create-assignment-form-container">
        <form onSubmit={handleSubmit} className="create-assignment-form">
          {errors.submit && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {errors.submit}
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="title">Assignment Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={errors.title ? 'error' : ''}
                placeholder="Enter assignment title"
              />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="batchId">Batch * (Active Only)</label>
              <select
                id="batchId"
                name="batchId"
                value={formData.batchId}
                onChange={handleChange}
                className={errors.batchId ? 'error' : ''}
                disabled={batches.length === 0}
              >
                <option value="">
                  {batches.length === 0 ? 'No active batches available' : 'Select an active batch'}
                </option>
                {batches.map(batch => {
                  const startDate = new Date(batch.startDate).toLocaleDateString()
                  const endDate = new Date(batch.endDate).toLocaleDateString()
                  const studentCount = batch.students ? batch.students.length : 0

                  return (
                    <option key={batch._id} value={batch._id}>
                      {batch.name} ({startDate} - {endDate}) • {studentCount} students
                    </option>
                  )
                })}
              </select>
              {errors.batchId && <span className="field-error">{errors.batchId}</span>}
              {batches.length === 0 && (
                <div className="info-message">
                  <i className="fas fa-info-circle"></i>
                  Only active batches that have started and haven't ended are shown here.
                  {/* Active = isActive: true, startDate ≤ today, endDate > today */}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="courseId">Course *</label>
              <select
                id="courseId"
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                className={errors.courseId ? 'error' : ''}
                disabled={!formData.batchId}
              >
                <option value="">
                  {!formData.batchId ? 'Select a batch first' : 'Select a course'}
                </option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </select>
              {errors.courseId && <span className="field-error">{errors.courseId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date *</label>
              <input
                type="datetime-local"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={errors.dueDate ? 'error' : ''}
              />
              {errors.dueDate && <span className="field-error">{errors.dueDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="maxScore">Maximum Score *</label>
              <input
                type="number"
                id="maxScore"
                name="maxScore"
                value={formData.maxScore}
                onChange={handleChange}
                className={errors.maxScore ? 'error' : ''}
                min="1"
                placeholder="100"
              />
              {errors.maxScore && <span className="field-error">{errors.maxScore}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="submissionType">Submission Type</label>
              <select
                id="submissionType"
                name="submissionType"
                value={formData.submissionType}
                onChange={handleChange}
              >
                <option value="text">Text Submission</option>
                <option value="file">File Upload</option>
                <option value="both">Text & File</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              placeholder="Describe the assignment requirements"
              rows="4"
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>

          <div className="form-group full-width">
            <label htmlFor="instructions">Instructions</label>
            <textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Provide detailed instructions for students"
              rows="6"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="create-assignment-btn create-assignment-btn-outline"
              onClick={() => navigate('/teacher/assignments')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="create-assignment-btn create-assignment-btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Creating...
                </>
              ) : (
                <>
                  <i className="fas fa-plus"></i> Create Assignment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateAssignmentPage
