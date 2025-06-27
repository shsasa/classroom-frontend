import './styles/App.css'
import './styles/theme.css'
import { useContext, useEffect, useCallback } from 'react'
import { Route, Routes } from 'react-router'
import { AuthContext } from './context/AuthContext'
import { CheckSession } from './services/Auth'
import Nav from './components/Nav'
import SignIn from './pages/SignIn'
import Home from './pages/Home'
import AddUser from './pages/AddUser'
import UsersList from './pages/UsersList'
import ActivateAccount from './pages/ActivateAccount'

const App = () => {
  const { user, login, logout } = useContext(AuthContext)

  // Check for token on app load - only once
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user')

        // Only check session if both token and user exist AND user is not already set
        if (token && savedUser && !user) {
          const session = await CheckSession()
          console.log('CHECK SESSION USER:', session)
          login(session.user)
        }
      } catch (error) {
        console.error('Session check failed:', error)
        logout()
      }
    }

    checkSession()
  }, [login, logout, user])

  // Handle logout and clear local storage
  const handleLogOut = useCallback(() => {
    logout()
    localStorage.clear()
  }, [logout])

  return (
    <>
      <Nav handleLogOut={handleLogOut} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/add-user" element={<AddUser />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="/activate-account" element={<ActivateAccount />} />

          {/* <Route path="/profile" element={<Profile />} /> */}
        </Routes>
      </main>
    </>
  )
}

export default App