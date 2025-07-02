import React, { useState, useContext } from 'react'
import { toast } from 'react-toastify'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import '../styles/Profile.css'

const Profile = () => {
  const { user } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)

  // Profile info state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })

  // Password change state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.put('/users/profile', {
        name: profileData.name,
        email: profileData.email
      })

      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.msg || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      await api.put('/auth/update-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      })

      toast.success('Password updated successfully!')
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error updating password:', error)
      toast.error(error.response?.data?.msg || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt={user.name} />
          ) : (
            <span className="avatar-placeholder">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="profile-info">
          <h1>{user?.name}</h1>
          <span className={`role-badge role-${user?.role}`}>
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </span>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="tab-icon">👤</span>
            Profile Information
          </button>
          <button
            className={`tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <span className="tab-icon">🔒</span>
            Change Password
          </button>
        </div>

        <div className="profile-tab-content">
          {activeTab === 'profile' && (
            <div className="tab-panel">
              <h2>Profile Information</h2>
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <input
                    type="text"
                    value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                    disabled
                    className="disabled-input"
                  />
                  <small className="form-help">Role can only be changed by administrators</small>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="tab-panel">
              <h2>Change Password</h2>
              <form onSubmit={handlePasswordChange} className="password-form">
                <div className="form-group">
                  <label htmlFor="oldPassword">Current Password</label>
                  <input
                    type="password"
                    id="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <small className="form-help">Password must be at least 6 characters long</small>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
