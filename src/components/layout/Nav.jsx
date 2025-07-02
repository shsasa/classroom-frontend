import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import '../../styles/Nav.css'

const Nav = ({ onToggleSidebar, onCloseSidebar }) => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogOut = () => {
    logout()
    navigate('/signin')
  }

  const handleBrandClick = () => {
    // Close sidebar when brand is clicked
    if (onCloseSidebar) {
      onCloseSidebar()
    }
    // Navigate to home
    navigate('/')
  }

  // Don't show navbar on certain pages
  if (location.pathname === '/signin' || location.pathname === '/activate-account') {
    return null
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {user && (
          <button
            className="sidebar-toggle-btn"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        )}
        <div
          className="navbar-brand clickable"
          onClick={handleBrandClick}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleBrandClick()
            }
          }}
        >
          Classroom Manager
        </div>
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            <div className="user-info-nav">
              <div className="user-avatar">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} />
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <span className="user-name">Welcome, {user.name || user.email}</span>
            </div>
            <button className="logout-btn" onClick={handleLogOut}>
              Log Out
            </button>
          </>
        ) : (
          <Link to="/signin" className="signin-link">Sign In</Link>
        )}
      </div>
    </nav>
  )
}

export default Nav
