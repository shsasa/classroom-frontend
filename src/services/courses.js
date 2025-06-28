import api from './api'

// Get all courses with optional filters
export const getAllCourses = async (filters = {}) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const params = new URLSearchParams()
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive)
    if (filters.search) params.append('search', filters.search)
    if (filters.teacher) params.append('teacher', filters.teacher)
    if (filters.batch) params.append('batch', filters.batch)

    const response = await api.get(`/courses?${params.toString()}`)
    return response.data
  } catch (error) {
    console.error('Error fetching courses:', error)
    throw error
  }
}

// Get course by ID
export const getCourseById = async (id) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await api.get(`/courses/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching course:', error)
    throw error
  }
}

// Create new course
export const createCourse = async (courseData) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    console.log('Creating course with data:', courseData)

    const response = await api.post('/courses', courseData)
    console.log('Course created successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating course:', error)
    console.error('Error response:', error.response?.data)
    console.error('Error status:', error.response?.status)
    throw error
  }
}

// Update course
export const updateCourse = async (id, courseData) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    console.log('Updating course with data:', courseData)

    const response = await api.put(`/courses/${id}`, courseData)
    console.log('Course updated successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error updating course:', error)
    console.error('Error response:', error.response?.data)
    console.error('Error status:', error.response?.status)
    throw error
  }
}

// Delete course
export const deleteCourse = async (id) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await api.delete(`/courses/${id}`)
    console.log('Course deleted successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error deleting course:', error)
    console.error('Error response:', error.response?.data)
    console.error('Error status:', error.response?.status)
    throw error
  }
}
