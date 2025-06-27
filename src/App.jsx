import './App.css'
import { useContext, useEffect } from 'react'
import { Route, Routes } from 'react-router'
import { AuthContext } from './context/AuthContext'
import { CheckSession } from './services/Auth'
import Nav from './components/Nav'
import SignIn from './pages/SignIn'
import Home from './pages/Home'

const App = () => {
  const { user, login, logout } = useContext(AuthContext)


  useEffect(() => {
    const token = localStorage.getItem('token')

    if (token) {
      checkSession()
    }
  }, [])

  const handleLogOut = () => {
    logout()

    localStorage.clear()
  }

  const checkSession = async () => {
    try {
      const user = await CheckSession()
      login(user)
    } catch (error) {
      console.error('Session check failed:', error)
      logout()
    }
  }
  return (
    <>
      <Nav user={user} handleLogOut={handleLogOut} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />


          {/* <Route path="/profile" element={<Profile />} /> */}
        </Routes>
      </main>
    </>
  )
}

export default App