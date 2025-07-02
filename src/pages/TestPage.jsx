import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import '../styles/TestPage.css'

const TestPage = () => {
  const { user } = useContext(AuthContext)

  if (!user) {
    return (
      <div className="test-page">
        <h1>Test Page</h1>
        <p>Please log in to test the application.</p>
        <Link to="/signin">Go to Sign In</Link>
      </div>
    )
  }

  const studentRoutes = [
    { path: '/student/batches', label: 'My Batches' },
    { path: '/student/courses', label: 'My Courses' }
  ]

  const adminRoutes = [
    { path: '/users', label: 'Users Management' },
    { path: '/courses', label: 'All Courses' },
    { path: '/batches', label: 'All Batches' },
    { path: '/announcements', label: 'Announcements' }
  ]

  return (
    <div className="test-page">
      <h1>Application Test Page</h1>

      <div className="user-info">
        <h2>Current User Information</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>

      <div className="available-routes">
        <h2>Available Routes for {user.role}</h2>

        {user.role === 'student' && (
          <div className="route-section">
            <h3>Student Routes</h3>
            <ul>
              {studentRoutes.map(route => (
                <li key={route.path}>
                  <Link to={route.path}>{route.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {['admin', 'supervisor'].includes(user.role) && (
          <div className="route-section">
            <h3>Admin/Supervisor Routes</h3>
            <ul>
              {adminRoutes.map(route => (
                <li key={route.path}>
                  <Link to={route.path}>{route.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="route-section">
          <h3>Common Routes</h3>
          <ul>
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/profile">Profile Settings</Link></li>
            <li><Link to="/announcements">Announcements</Link></li>
          </ul>
        </div>
      </div>

      <div className="password-reset-test">
        <h2>Password Reset Test</h2>
        <p>Test the password reset functionality:</p>
        <Link to="/forgot-password">Forgot Password Page</Link>
      </div>
    </div>
  )
}

export default TestPage
