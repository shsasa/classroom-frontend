import React, { useState, useEffect, useContext, useCallback, useRef } from 'react'
import { AuthContext } from '../context/AuthContext'
import { getAllUsers, changeUserRole, changeUserStatus, deleteUser, generateResetToken, getUserResetToken } from '../services/users'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import '../styles/UsersList.css'

const UsersList = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  })
  const searchTimeoutRef = useRef(null)
  const initialLoadRef = useRef(false)

  // Function to fetch users from API
  const fetchUsers = useCallback(async (searchFilters) => {
    if (!user || (user.role !== 'admin' && user.role !== 'supervisor')) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setSearching(false) // Clear searching state when actually fetching
      const usersData = await getAllUsers(searchFilters || filters)
      setUsers(usersData)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [user, filters])

  // Initial load when component mounts and user is available
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'supervisor') && !initialLoadRef.current) {
      initialLoadRef.current = true
      fetchUsers(filters)
    }
  }, [user, fetchUsers, filters])

  // Handle all filter changes (with proper debounce for search)
  useEffect(() => {
    if (!initialLoadRef.current || !user || (user.role !== 'admin' && user.role !== 'supervisor')) {
      return
    }

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
      searchTimeoutRef.current = null
    }

    // If search has content, apply debounce
    if (filters.search.trim()) {
      setSearching(true)

      searchTimeoutRef.current = setTimeout(() => {
        fetchUsers(filters)
      }, 2000)
    } else {
      // For role/status changes or empty search, fetch immediately
      setSearching(false)
      fetchUsers(filters)
    }

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
        searchTimeoutRef.current = null
      }
    }
  }, [filters, fetchUsers, user])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Check if user has permission to view this page
  if (!user || (user.role !== 'admin' && user.role !== 'supervisor')) {
    return (
      <div className="users-list-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to view this page.</p>
        </div>
      </div>
    )
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      // Show loading state for this specific user action
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, updating: true } : user
        )
      )

      await changeUserRole(userId, newRole)
      toast.success('User role updated successfully')

      // Update the local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, role: newRole, updating: false } : user
        )
      )
    } catch (error) {
      console.error('Error changing user role:', error)
      toast.error('Failed to update user role')

      // Remove loading state on error
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, updating: false } : user
        )
      )
    }
  }

  const handleStatusChange = async (userId, newStatus) => {
    try {
      // Show loading state for this specific user action
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, updating: true } : user
        )
      )

      await changeUserStatus(userId, newStatus)
      toast.success('User status updated successfully')

      // Update the local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, accountStatus: newStatus, updating: false } : user
        )
      )
    } catch (error) {
      console.error('Error changing user status:', error)
      toast.error(`Failed to update user status: ${error.response?.data?.msg || error.message}`)

      // Remove loading state on error
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, updating: false } : user
        )
      )
    }
  }

  const handleShowResetToken = async (userId, userName) => {
    try {
      const response = await getUserResetToken(userId)

      // Create activation link
      const activationLink = `${window.location.origin}/activate-account?token=${response.resetToken}`

      // Copy activation link to clipboard
      navigator.clipboard.writeText(activationLink).then(() => {
        toast.success('Activation link copied to clipboard!')

        // Show additional info about the token
        const message = `Activation link for ${userName} copied to clipboard!\n\nToken expires at: ${new Date(response.expiresAt).toLocaleString()}\n\nPlease share this link with the user to activate their account.`
        alert(message)
      }).catch(() => {
        // Fallback: copy just the token
        navigator.clipboard.writeText(response.resetToken).then(() => {
          toast.success('Activation token copied to clipboard!')

          const message = `Activation token for ${userName} copied to clipboard!\n\nToken: ${response.resetToken}\nExpires at: ${new Date(response.expiresAt).toLocaleString()}\n\nPlease share this token with the user to activate their account.`
          alert(message)
        }).catch(() => {
          toast.info('Activation token displayed. Please copy manually.')

          const message = `Activation Token for ${userName}:\n\n${response.resetToken}\n\nExpires at: ${new Date(response.expiresAt).toLocaleString()}\n\nPlease copy this token and share it with the user.`
          alert(message)
        })
      })
    } catch (error) {
      console.error('Error getting activation token:', error)
      if (error.response?.status === 404) {
        toast.error('No active activation token found for this user')
      } else {
        toast.error('Failed to get activation token')
      }
    }
  }

  const handleGenerateResetToken = async (userId, userName) => {
    if (window.confirm(`Generate activation token for ${userName}? This will allow the user to activate their account and set their password.`)) {
      try {
        // Show loading state for this specific user action
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId ? { ...user, updating: true } : user
          )
        )

        const response = await generateResetToken(userId)

        toast.success('Activation token generated successfully!')

        // Update the user data to show the new activation token info
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId ? {
              ...user,
              updating: false,
              hasActiveResetToken: true,
              resetTokenExpires: response.expiresAt
            } : user
          )
        )
      } catch (error) {
        console.error('Error generating activation token:', error)
        toast.error('Failed to generate activation token')

        // Remove loading state on error
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId ? { ...user, updating: false } : user
          )
        )
      }
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        // Show loading state for this specific user action
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId ? { ...user, updating: true } : user
          )
        )

        await deleteUser(userId)
        toast.success('User deactivated successfully')

        // Update the local state
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId ? { ...user, accountStatus: 'inactive', updating: false } : user
          )
        )
      } catch (error) {
        console.error('Error deactivating user:', error)
        toast.error('Failed to deactivate user')

        // Remove loading state on error
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId ? { ...user, updating: false } : user
          )
        )
      }
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))

    // If clearing search, immediately clear searching state
    if (name === 'search' && !value.trim()) {
      setSearching(false)
      // Clear any pending timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
        searchTimeoutRef.current = null
      }
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (user && (user.role === 'admin' || user.role === 'supervisor')) {
      // Clear any pending timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
        searchTimeoutRef.current = null
      }
      setSearching(false)
      fetchUsers(filters)
    }
  }

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (user && (user.role === 'admin' || user.role === 'supervisor')) {
        // Clear any pending timeout
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current)
          searchTimeoutRef.current = null
        }
        setSearching(false)
        fetchUsers(filters)
      }
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'status-badge active'
      case 'pending':
        return 'status-badge pending'
      case 'inactive':
        return 'status-badge inactive'
      default:
        return 'status-badge'
    }
  }

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'role-badge admin'
      case 'supervisor':
        return 'role-badge supervisor'
      case 'teacher':
        return 'role-badge teacher'
      case 'student':
        return 'role-badge student'
      default:
        return 'role-badge'
    }
  }

  const handleAddUser = () => {
    navigate('/add-user')
  }

  const clearFilters = () => {
    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
      searchTimeoutRef.current = null
    }

    setFilters({
      role: '',
      status: '',
      search: ''
    })
    setSearching(false)
  }

  if (loading) {
    return (
      <div className="users-list-container">
        <div className="loading">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="users-list-container">
      <div className="users-list-header">
        <div className="users-header-content">
          <h1>Users Management</h1>
          <p>Manage all users in the system</p>
        </div>
        <div className="header-actions">
          <button
            className="add-user-btn"
            onClick={handleAddUser}
          >
            + Add User
          </button>
          {(filters.role || filters.status || filters.search) && (
            <button
              className="clear-filters-btn"
              onClick={clearFilters}
              title="Clear all filters"
            >
              🗑️ Clear Filters
            </button>
          )}
          <button
            className="refresh-btn"
            onClick={() => {
              // Clear any pending timeout
              if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
                searchTimeoutRef.current = null
              }
              setSearching(false)
              fetchUsers(filters)
            }}
            disabled={loading}
          >
            {loading ? 'Loading...' : '↻ Refresh'}
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group search-group">
            <label>Search Users:</label>
            <div className="search-input-container">
              <input
                type="text"
                name="search"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={handleFilterChange}
                onKeyPress={handleSearchKeyPress}
              />
              <button
                type="button"
                className="search-btn"
                onClick={handleSearchSubmit}
                title="Search now"
                disabled={searching}
              >
                {searching ? '⏳' : '🔍'}
              </button>
            </div>
          </div>

          <div className="filter-group">
            <label>Filter by Role:</label>
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Filter by Status:</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="users-table-container">
        {users.length === 0 ? (
          <div className="no-users">
            {filters.search || filters.role || filters.status ? (
              <div>
                <h3>No users found matching your criteria</h3>
                <p>Try adjusting your search terms or filters.</p>
                <button className="clear-filters-btn" onClick={clearFilters}>
                  🗑️ Clear All Filters
                </button>
              </div>
            ) : (
              <div>
                <h3>No users found</h3>
                <p>There are no users in the system yet.</p>
                <button className="add-user-btn" onClick={handleAddUser}>
                  + Add First User
                </button>
              </div>
            )}
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Activation Token</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userData) => (
                <tr key={userData._id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {userData.profilePicture ? (
                          <img src={userData.profilePicture} alt={userData.name} />
                        ) : (
                          <span>{userData.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="user-name">{userData.name}</span>
                    </div>
                  </td>
                  <td>{userData.email}</td>
                  <td>
                    <span className={getRoleBadgeClass(userData.role)}>
                      {userData.role}
                    </span>
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(userData.accountStatus)}>
                      {userData.accountStatus}
                    </span>
                  </td>
                  <td>
                    <div className="reset-token-status">
                      {userData.hasActiveResetToken ? (
                        <div className="reset-token-info">
                          <span className="token-active">Active</span>
                          <button
                            className="show-token-btn"
                            onClick={() => handleShowResetToken(userData._id, userData.name)}
                            title="Show activation token"
                          >
                            📋
                          </button>
                          <small className="token-expires">
                            Expires: {new Date(userData.resetTokenExpires).toLocaleDateString()}
                          </small>
                        </div>
                      ) : (
                        <span className="token-inactive">No active token</span>
                      )}
                    </div>
                  </td>
                  <td>{new Date(userData.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="actions-dropdown">
                      {userData.updating ? (
                        <div className="updating-indicator">Updating...</div>
                      ) : (
                        <select
                          onChange={(e) => {
                            const [action, value] = e.target.value.split(':')
                            if (action === 'role') {
                              handleRoleChange(userData._id, value)
                            } else if (action === 'status') {
                              handleStatusChange(userData._id, value)
                            } else if (action === 'delete') {
                              handleDeleteUser(userData._id)
                            } else if (action === 'reset-token') {
                              handleGenerateResetToken(userData._id, userData.name)
                            } else if (action === 'show-token') {
                              handleShowResetToken(userData._id, userData.name)
                            }
                            e.target.value = '' // Reset dropdown
                          }}
                          defaultValue=""
                          disabled={userData.updating}
                        >
                          <option value="">Actions</option>
                          <optgroup label="Change Role">
                            {userData.role !== 'student' && <option value="role:student">Set as Student</option>}
                            {userData.role !== 'teacher' && <option value="role:teacher">Set as Teacher</option>}
                            {userData.role !== 'supervisor' && user.role === 'admin' && <option value="role:supervisor">Set as Supervisor</option>}
                            {userData.role !== 'admin' && user.role === 'admin' && <option value="role:admin">Set as Admin</option>}
                          </optgroup>
                          <optgroup label="Change Status">
                            {userData.accountStatus !== 'active' && <option value="status:active">Activate</option>}
                            {userData.accountStatus !== 'pending' && <option value="status:pending">Set Pending</option>}
                            {userData.accountStatus !== 'inactive' && <option value="status:inactive">Deactivate</option>}
                          </optgroup>
                          <optgroup label="Danger Zone">
                            <option value="delete" style={{ color: 'red' }}>Deactivate User</option>
                          </optgroup>
                          <optgroup label="Reset Password">
                            <option value="reset-token" style={{ color: 'orange' }}>Generate Activation Token</option>
                            <option value="show-token" style={{ color: 'blue' }}>Show Activation Token</option>
                          </optgroup>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="users-summary">
        <div className="summary-stats">
          <span className="total-count">Total Users: {users.length}</span>
          {(filters.role || filters.status || filters.search) && (
            <span className="filtered-info">
              (Filtered from all users)
            </span>
          )}
        </div>
        {filters.search && (
          <div className="search-info">
            <small>Search results for: "{filters.search}"</small>
          </div>
        )}
      </div>
    </div>
  )
}

export default UsersList
