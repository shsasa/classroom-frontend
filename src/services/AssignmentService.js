import api from './api'

// Assignment API functions

// Get all assignments for student
export const GetStudentAssignments = async () => {
  try {
    const response = await api.get('/assignments/student/my-assignments')
    return response.data
  } catch (error) {
    console.error('Error fetching student assignments:', error)
    throw error
  }
}

// Get specific assignment details for student
export const GetStudentAssignmentById = async (id) => {
  try {
    const response = await api.get(`/assignments/student/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching student assignment details:', error)
    throw error
  }
}

// Get all assignments for teacher
export const GetTeacherAssignments = async () => {
  try {
    const response = await api.get('/assignments/teacher/my-assignments')
    return response.data
  } catch (error) {
    console.error('Error fetching teacher assignments:', error)
    throw error
  }
}

// Get specific assignment details for teacher
export const GetTeacherAssignmentById = async (id) => {
  try {
    const response = await api.get(`/assignments/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching teacher assignment details:', error)
    throw error
  }
}

// Create new assignment
export const CreateAssignment = async (assignmentData) => {
  try {
    const response = await api.post('/assignments', assignmentData)
    return response.data
  } catch (error) {
    console.error('Error creating assignment:', error)
    throw error
  }
}

// Update assignment
export const UpdateAssignment = async (id, assignmentData) => {
  try {
    const response = await api.put(`/assignments/${id}`, assignmentData)
    return response.data
  } catch (error) {
    console.error('Error updating assignment:', error)
    throw error
  }
}

// Delete assignment
export const DeleteAssignment = async (id) => {
  try {
    const response = await api.delete(`/assignments/${id}`)
    return response.data
  } catch (error) {
    console.error('Error deleting assignment:', error)
    throw error
  }
}

// Submit assignment (for students)
export const SubmitAssignment = async (assignmentId, submissionData) => {
  try {
    const formData = new FormData()
    formData.append('assignmentId', assignmentId)
    formData.append('submissionText', submissionData.submissionText || '')

    if (submissionData.files && submissionData.files.length > 0) {
      submissionData.files.forEach(file => {
        formData.append('files', file)
      })
    }

    const response = await api.post('/submissions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  } catch (error) {
    console.error('Error submitting assignment:', error)
    throw error
  }
}

// Get submissions for an assignment (for teachers)
export const GetAssignmentSubmissions = async (assignmentId) => {
  try {
    const response = await api.get(`/submissions/assignment/${assignmentId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching assignment submissions:', error)
    throw error
  }
}

// Grade a submission (for teachers)
export const GradeSubmission = async (submissionId, gradeData) => {
  try {
    const response = await api.put(`/submissions/${submissionId}/grade`, gradeData)
    return response.data
  } catch (error) {
    console.error('Error grading submission:', error)
    throw error
  }
}

export default {
  GetStudentAssignments,
  GetStudentAssignmentById,
  GetTeacherAssignments,
  GetTeacherAssignmentById,
  CreateAssignment,
  UpdateAssignment,
  DeleteAssignment,
  SubmitAssignment,
  GetAssignmentSubmissions,
  GradeSubmission
}
