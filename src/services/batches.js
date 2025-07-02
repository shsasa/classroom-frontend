import api from './api'

// Get all batches for current teacher
export const getTeacherBatches = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await api.get('/batches/teacher/my-batches')
    return response.data
  } catch (error) {
    console.error('Error fetching teacher batches:', error)
    throw error
  }
}

// Get all batches for current student
export const getStudentBatches = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await api.get('/batches/student/my-batches')
    return response.data
  } catch (error) {
    console.error('Error fetching student batches:', error)
    throw error
  }
}

// Get batch by ID
export const getBatchById = async (id) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await api.get(`/batches/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching batch:', error)
    throw error
  }
}

// Get courses for specific batch
export const getBatchCourses = async (batchId) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    // Get batch details which includes populated courses
    const response = await api.get(`/batches/${batchId}`)
    return response.data.courses || []
  } catch (error) {
    console.error('Error fetching batch courses:', error)
    throw error
  }
}

export default {
  getTeacherBatches,
  getStudentBatches,
  getBatchById,
  getBatchCourses
}
