import React from 'react'

const Nav = ({ user, handleLogOut }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">Classroom Manager</div>
      <div className="navbar-links">
        {user ? (
          <>
            <span>Welcome, {user.name || user.email}</span>
            <button onClick={handleLogOut}>Log Out</button>
          </>
        ) : null}
      </div>
    </nav>
  )
}

export default Nav
