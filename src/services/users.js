import api from './api'

// Get all users with optional filters
export const getAllUsers = async (filters = {}) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const params = new URLSearchParams()
    if (filters.role) params.append('role', filters.role)
    if (filters.status) params.append('status', filters.status)
    if (filters.search) params.append('search', filters.search)

    const response = await api.get(`/users?${params.toString()}`)
    return response.data
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

// Get user by ID
export const getUserById = async (id) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await api.get(`/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

// Update user
export const updateUser = async (id, userData) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await api.put(`/users/${id}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

// Delete user (soft delete)
export const deleteUser = async (id) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await api.delete(`/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

// Change user role
export const changeUserRole = async (id, role) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await api.put(`/users/${id}/role`, { role })
    return response.data
  } catch (error) {
    console.error('Error changing user role:', error)
    throw error
  }
}

// Change user status
export const changeUserStatus = async (id, accountStatus) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await api.put(`/users/${id}/status`, { accountStatus })
    return response.data
  } catch (error) {
    console.error('Error changing user status:', error)
    throw error
  }
}

// Generate reset token for user (admin/supervisor only)
export const generateResetToken = async (userId) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await api.post(`/auth/generate-reset-token/${userId}`, {})
    return response.data
  } catch (error) {
    console.error('Error generating reset token:', error)
    throw error
  }
}

// Reset password using token
export const resetPassword = async (resetToken, password) => {
  try {
    const response = await api.post('/auth/reset-password', {
      resetToken,
      password
    })
    return response.data
  } catch (error) {
    console.error('Error resetting password:', error)
    throw error
  }
}

// Activate account and set password for first time
export const activateAccount = async (activationToken, password) => {
  try {
    const response = await api.post('/auth/activate-account', {
      resetToken: activationToken, // Using resetToken field for consistency with backend
      password
    })
    return response.data
  } catch (error) {
    console.error('Error activating account:', error)
    console.error('Error response:', error.response?.data)
    console.error('Error status:', error.response?.status)
    throw error
  }
}

// Get user's reset token (admin/supervisor only)
export const getUserResetToken = async (userId) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await api.get(`/users/${userId}/reset-token`)
    return response.data
  } catch (error) {
    console.error('Error getting user reset token:', error)
    throw error
  }
}
