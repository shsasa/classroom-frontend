import React, { useContext } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import '../../styles/Sidebar.css'

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext)
  const location = useLocation()

  // Don't show sidebar on login page
  if (location.pathname === '/signin' || location.pathname === '/activate-account') {
    return null
  }

  // Only show sidebar if user is logged in
  if (!user) {
    return null
  }

  const menuItems = [
    {
      path: '/',
      icon: '🏠',
      label: 'Dashboard',
      roles: ['admin', 'supervisor', 'teacher', 'student']
    },
    {
      path: '/users',
      icon: '👥',
      label: 'Users Management',
      roles: ['admin', 'supervisor']
    },

    {
      path: '/courses',
      icon: '📚',
      label: 'Courses',
      roles: ['admin', 'supervisor', 'teacher', 'student']
    },


    {
      path: '/attendance',
      icon: '📊',
      label: 'Attendance',
      roles: ['admin', 'supervisor', 'teacher']
    },
    {
      path: '/announcements',
      icon: '📢',
      label: 'Announcements',
      roles: ['admin', 'supervisor', 'teacher', 'student']
    },
    {
      path: '/batches',
      icon: '🎓',
      label: 'Batches',
      roles: ['admin', 'supervisor', 'teacher']
    },
    {
      path: '/student/batches',
      icon: '🎓',
      label: 'My Batches',
      roles: ['student']
    },
    {
      path: '/student/courses',
      icon: '📚',
      label: 'My Courses',
      roles: ['student']
    },
    {
      path: '/student/assignments',
      icon: '📝',
      label: 'My Assignments',
      roles: ['student']
    },
    {
      path: '/student/attendance',
      icon: '📊',
      label: 'My Attendance',
      roles: ['student']
    },
    {
      path: '/teacher/assignments',
      icon: '📋',
      label: 'My Assignments',
      roles: ['teacher']
    },

    {
      path: '/profile',
      icon: '⚙️',
      label: 'Profile Settings',
      roles: ['admin', 'supervisor', 'teacher', 'student']
    }
  ]

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(user.role)
  )

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <span className="sidebar__logo-icon">📚</span>
            <h3 className="sidebar__logo-text">Classroom Manager</h3>
          </div>
          <button
            className="sidebar__close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <div className="sidebar__user-info">
          <div className="sidebar__avatar">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} />
            ) : (
              <span>{user.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="sidebar__user-details">
            <h4 className="sidebar__user-name">{user.name}</h4>
            <span className={`sidebar__user-role sidebar__user-role--${user.role}`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>
        </div>

        <nav className="sidebar__nav">
          <ul className="sidebar__menu">
            {filteredMenuItems.map((item) => (
              <li key={item.path} className="sidebar__menu-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar__menu-link ${isActive ? 'sidebar__menu-link--active' : ''}`
                  }
                  onClick={() => {
                    // Close sidebar on mobile when navigating
                    if (window.innerWidth <= 768) {
                      onClose()
                    }
                  }}
                >
                  <span className="sidebar__menu-icon">{item.icon}</span>
                  <span className="sidebar__menu-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__app-info">
            <small>Classroom Manager v1.0</small>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
