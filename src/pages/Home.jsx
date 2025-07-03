import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import '../styles/Home.css'

const Home = () => {
  const { user } = useContext(AuthContext)

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return '👨‍💼'
      case 'supervisor':
        return '🧐'
      case 'teacher':
        return '👨‍🏫'
      case 'student':
        return '👨‍🎓'
      default:
        return '👤'
    }
  }

  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin':
        return 'You have full access to manage users, courses, and system settings.'
      case 'supervisor':
        return 'You can monitor teachers, courses, and overall system performance.'
      case 'teacher':
        return 'You can manage your classes, assignments, and track student progress.'
      case 'student':
        return 'You can access your courses, assignments, and track your progress.'
      default:
        return 'Welcome to the Classroom Manager platform.'
    }
  }

  // Get current date in a nice format
  const getCurrentDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return new Date().toLocaleDateString(undefined, options)
  }

  return (
    <div className="home-container">
      <div className="home-welcome-section">
        <div className="home-welcome-header">
          <div className="home-welcome-icon">
            {user ? getRoleIcon(user.role) : '🎓'}
          </div>
          <h1 className="home-welcome-title">
            {user ? `Welcome, ${user.name}!` : 'Welcome to Classroom Manager'}
          </h1>
          <p className="home-welcome-subtitle">
            {user ? getRoleInfo(user.role) : 'Please sign in to access all features'}
          </p>

          {user && (
            <div className="home-user-info">
              <span className={`home-role-badge home-role-${user.role}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              <span className="home-user-email">{user.email}</span>
            </div>
          )}
        </div>        {user && (
          <div className="home-system-info">
            <h2>Classroom Manager</h2>
            <div className="home-info-grid">
              <div className="home-info-card">
                <span className="home-info-icon">📅</span>
                <span className="home-info-title">Today's Date</span>
                <span className="home-info-value">{getCurrentDate()}</span>
              </div>

              <div className="home-info-card">
                <span className="home-info-icon">🔐</span>
                <span className="home-info-title">Last Login</span>
                <span className="home-info-value">Just now</span>
              </div>

              <div className="home-info-card">
                <span className="home-info-icon">📚</span>
                <span className="home-info-title">Platform</span>
                <span className="home-info-value">Classroom Manager</span>
              </div>
            </div>

            <div className="home-system-version">
              Version 1.0.0 • Educational Management System
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
