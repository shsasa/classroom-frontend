import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import '../styles/Home.css'

const Home = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  // Redirect users based on their role when they first login
  useEffect(() => {
    if (user && user.role) {
      const currentPath = window.location.pathname

      // Only redirect if user is on the exact home page
      if (currentPath === '/') {
        switch (user.role) {
          case 'admin':
          case 'supervisor':
            // Admins go to users management or batches
            setTimeout(() => navigate('/batches'), 500)
            break
          case 'teacher':
            // Teachers go to their batches
            setTimeout(() => navigate('/teacher/batches'), 500)
            break
          case 'student':
            // Students go to their batches
            setTimeout(() => navigate('/student/batches'), 500)
            break
          default:
            break
        }
      }
    }
  }, [user, navigate])

  const getRoleBasedWelcome = () => {
    if (!user) {
      return {
        title: 'Welcome to Classroom Manager',
        subtitle: 'Please sign in to access all features',
        icon: '🎓',
        actions: []
      }
    }

    switch (user.role) {
      case 'admin':
      case 'supervisor':
        return {
          title: `Welcome back, ${user.name}!`,
          subtitle: 'Manage your educational institution efficiently',
          icon: '👨‍💼',
          actions: [
            { label: 'Manage Users', path: '/users', icon: '👥' },
            { label: 'View Batches', path: '/batches', icon: '🎓' },
            { label: 'Manage Courses', path: '/courses', icon: '📚' },
            { label: 'Announcements', path: '/announcements', icon: '📢' }
          ]
        }
      case 'teacher':
        return {
          title: `Welcome back, Professor ${user.name}!`,
          subtitle: 'Manage your classes and assignments',
          icon: '👨‍🏫',
          actions: [
            { label: 'My Batches', path: '/teacher/batches', icon: '🎓' },
            { label: 'My Assignments', path: '/teacher/assignments', icon: '📝' },
            { label: 'Attendance', path: '/attendance', icon: '📊' },
            { label: 'Courses', path: '/courses', icon: '📚' }
          ]
        }
      case 'student':
        return {
          title: `Welcome back, ${user.name}!`,
          subtitle: 'Continue your learning journey',
          icon: '👨‍🎓',
          actions: [
            { label: 'My Batches', path: '/student/batches', icon: '🎓' },
            { label: 'My Assignments', path: '/student/assignments', icon: '📝' },
            { label: 'My Courses', path: '/student/courses', icon: '📚' },
            { label: 'My Attendance', path: '/student/attendance', icon: '📊' }
          ]
        }
      default:
        return {
          title: `Welcome, ${user.name}!`,
          subtitle: 'Explore the platform',
          icon: '👤',
          actions: []
        }
    }
  }

  const welcomeData = getRoleBasedWelcome()

  return (
    <div className="home-container">
      <div className="welcome-section">
        <div className="welcome-header">
          <div className="welcome-icon">{welcomeData.icon}</div>
          <h1 className="welcome-title">{welcomeData.title}</h1>
          <p className="welcome-subtitle">{welcomeData.subtitle}</p>
        </div>

        {user && welcomeData.actions.length > 0 && (
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              {welcomeData.actions.map((action, index) => (
                <button
                  key={index}
                  className="action-card"
                  onClick={() => navigate(action.path)}
                >
                  <span className="action-icon">{action.icon}</span>
                  <span className="action-label">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {user && (
          <div className="user-status">
            <div className="status-card">
              <span className="status-label">Logged in as:</span>
              <span className={`status-role role-${user.role}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
