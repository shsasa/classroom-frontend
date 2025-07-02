import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCourseById, updateCourse } from '../services/courses'
import { getAllUsers } from '../services/users'
import { toast } from 'react-toastify'
import '../styles/EditCourse.css'

const EditCourse = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [teachers, setTeachers] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    teachers: [],
    isActive: true,
    attachments: []
  })

  // Fetch course and teachers data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching course and teachers data...')

        // Fetch both course and teachers in parallel
        const [courseResponse, usersResponse] = await Promise.all([
          getCourseById(id),
          getAllUsers({ role: 'teacher' })
        ])

        console.log('Course data:', courseResponse)
        console.log('Teachers data:', usersResponse)

        // Set course data
        const course = courseResponse
        setFormData({
          name: course.name || '',
          description: course.description || '',
          teachers: course.teachers?.map(teacher =>
            typeof teacher === 'object' ? (teacher._id || teacher.id) : teacher
          ) || [],
          isActive: course.isActive !== undefined ? course.isActive : true,
          attachments: course.attachments || []
        })

        // Set teachers list
        setTeachers(usersResponse)

      } catch (error) {
        console.error('Error fetching data:', error)
        if (error.response?.status === 404) {
          toast.error('Course not found')
        } else {
          toast.error('Failed to load course data')
        }
        navigate('/courses')
      } finally {
        setPageLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id, navigate])

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

    setLoading(true)
    try {
      const courseData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        teachers: formData.teachers,
        isActive: formData.isActive,
        attachments: formData.attachments
      }

      console.log('Updating course with data:', courseData)
      const result = await updateCourse(id, courseData)
      console.log('Course update result:', result)
      toast.success('Course updated successfully!')
      navigate(`/courses/${id}`)
    } catch (error) {
      console.error('Error updating course:', error)
      if (error.response?.status === 403) {
        toast.error('Access denied. Only admins and supervisors can edit courses.')
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.msg || 'Invalid course data. Please check your input.'
        toast.error(errorMsg)
      } else if (error.response?.status === 401) {
        toast.error('Authentication required. Please log in again.')
      } else if (error.response?.status === 404) {
        toast.error('Course not found')
      } else {
        toast.error('Failed to update course. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate(`/courses/${id}`)
  }

  if (pageLoading) {
    return (
      <div className="edit-course-container">
        <div className="loading">Loading course data...</div>
      </div>
    )
  }

  return (
    <div className="edit-course-container">
      <div className="edit-course-card">
        <div className="edit-course-header">
          <h2>Edit Course</h2>
          <p>Update course information and assigned teachers</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-course-form">
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
                  <div key={teacher._id || teacher.id} className="course-teacher-item">
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
            <div className="course-checkbox-group">
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
              {loading ? 'Updating...' : 'Update Course'}
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

export default EditCourse
