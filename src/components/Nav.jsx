import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Nav.css'

const Nav = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const handleLogOut = () => {
    logout()
    navigate('/signin')
  }
  return (
    <nav className="navbar">
      <div className="navbar-brand">Classroom Manager</div>
      <div className="navbar-links">
        <button onClick={handleLogOut}>Log Out</button>

        {user ? (
          <>
            <span>Welcome, {user.name || user.email}</span>
            <Link to="/">Home</Link>
            <Link to="/courses">Courses</Link>
            {(user.role === 'admin' || user.role === 'supervisor') && (
              <Link to="/users">Manage Users</Link>
            )}
          </>
        ) : (
          <span><Link to="/signin">Sign In</Link></span>
        )}
      </div>
    </nav>
  )
}

export default Nav
