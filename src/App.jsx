import './styles/App.css'
import { useContext, useEffect, useCallback } from 'react'
import { Route, Routes } from 'react-router'
import { AuthContext } from './context/AuthContext'
import { CheckSession } from './services/Auth'
import Nav from './components/Nav'
import SignIn from './pages/SignIn'
import Home from './pages/Home'
import AddUser from './pages/AddUser'

const App = () => {
  const { user, login, logout } = useContext(AuthContext)

  // Check session and update user state
  const checkSession = useCallback(async () => {
    try {
      const session = await CheckSession()
      console.log('CHECK SESSION USER:', session)
      login(session.user)
    } catch (error) {
      console.error('Session check failed:', error)
      logout()
    }
  }, [login, logout])

  // Handle logout and clear local storage
  const handleLogOut = useCallback(() => {
    logout()
    localStorage.clear()
  }, [logout])

  // Check for token on app load
  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    // Only check session if both token and user exist
    if (token && savedUser) {
      checkSession()
    }
  }, [checkSession])

  return (
    <>
      <Nav handleLogOut={handleLogOut} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/add-user" element={<AddUser />} />

          {/* <Route path="/profile" element={<Profile />} /> */}
        </Routes>
      </main>
    </>
  )
}

export default App