import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCourse } from '../services/courses'
import { getAllUsers } from '../services/users'
import { toast } from 'react-toastify'
import '../styles/AddCourse.css'

const AddCourse = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [teachers, setTeachers] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    teachers: [],
    isActive: true,
    attachments: []
  })

  // Fetch teachers on component mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        console.log('Fetching teachers...')
        const users = await getAllUsers({ role: 'teacher' })
        console.log('Teachers fetched:', users)
        setTeachers(users)
      } catch (error) {
        console.error('Error fetching teachers:', error)
        toast.error('Failed to load teachers')
      }
    }

    fetchTeachers()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleTeacherSelection = (e) => {
    const teacherId = e.target.value
    const isChecked = e.target.checked

    if (isChecked) {
      setFormData(prev => ({
        ...prev,
        teachers: [...prev.teachers, teacherId]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        teachers: prev.teachers.filter(id => id !== teacherId)
      }))
    }
  }

  const handleAttachmentAdd = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = '.pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png'

    input.onchange = (e) => {
      const files = Array.from(e.target.files)
      const fileNames = files.map(file => file.name)

      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...fileNames]
      }))

      toast.info(`${files.length} file(s) added. Note: File upload functionality needs backend implementation.`)
    }

    input.click()
  }

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      toast.error('Course name is required')
      return
    }

    if (formData.name.trim().length < 3) {
      toast.error('Course name must be at least 3 characters long')
      return
    }

    if (formData.teachers.length === 0) {
      const confirmWithoutTeacher = window.confirm('No teachers assigned to this course. Continue anyway?')
      if (!confirmWithoutTeacher) {
        return
      }
    }

    setLoading(true)
    try {
      const courseData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        teachers: formData.teachers,
        isActive: formData.isActive,
        attachments: formData.attachments
      }

      console.log('Submitting course data:', courseData)
      const result = await createCourse(courseData)
      console.log('Course creation result:', result)
      toast.success('Course created successfully!')
      navigate('/courses')
    } catch (error) {
      console.error('Error creating course:', error)
      if (error.response?.status === 403) {
        toast.error('Access denied. Only admins and supervisors can create courses.')
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.msg || 'Invalid course data. Please check your input.'
        toast.error(errorMsg)
      } else if (error.response?.status === 401) {
        toast.error('Authentication required. Please log in again.')
      } else {
        toast.error('Failed to create course. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/courses')
  }

  return (
    <div className="add-course-container">
      <div className="add-course-card">
        <div className="add-course-header">
          <h2>Add New Course</h2>
          <p>Create a new course and assign teachers</p>
        </div>

        <form onSubmit={handleSubmit} className="add-course-form">
          <div className="form-group">
            <label htmlFor="name">Course Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter course name"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter course description (optional)"
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>
              Assign Teachers
              {formData.teachers.length > 0 && (
                <span className="selected-count">({formData.teachers.length} selected)</span>
              )}
            </label>
            <div className="teachers-selection">
              {teachers.length > 0 ? (
                teachers.map(teacher => (
                  <div key={teacher._id || teacher.id} className="teacher-checkbox">
                    <input
                      type="checkbox"
                      id={`teacher-${teacher._id || teacher.id}`}
                      value={teacher._id || teacher.id}
                      checked={formData.teachers.includes(teacher._id || teacher.id)}
                      onChange={handleTeacherSelection}
                      disabled={loading}
                    />
                    <label htmlFor={`teacher-${teacher._id || teacher.id}`}>
                      {teacher.name} ({teacher.email})
                    </label>
                  </div>
                ))
              ) : (
                <p className="no-teachers">No teachers available</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Attachments</label>
            <div className="attachments-section">
              <button
                type="button"
                className="add-attachment-btn"
                onClick={handleAttachmentAdd}
                disabled={loading}
              >
                Add Files
              </button>

              {formData.attachments.length > 0 && (
                <div className="attachments-list">
                  {formData.attachments.map((filename, index) => (
                    <div key={index} className="attachment-item">
                      <span className="attachment-name">{filename}</span>
                      <button
                        type="button"
                        className="remove-attachment-btn"
                        onClick={() => removeAttachment(index)}
                        disabled={loading}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="isActive">Course is active</label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || !formData.name.trim()}
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddCourse
