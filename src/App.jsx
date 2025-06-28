import './styles/App.css'
import './styles/theme.css'
import { useContext, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router'
import { AuthContext } from './context/AuthContext'
import { CheckSession } from './services/Auth'
import Nav from './components/Nav'
import Sidebar from './components/Sidebar'
import SignIn from './pages/SignIn'
import Home from './pages/Home'
import AddUser from './pages/AddUser'
import UsersList from './pages/UsersList'
import ActivateAccount from './pages/ActivateAccount'
import AddCourse from './pages/AddCourse'
import CoursesList from './pages/CoursesList'
import CourseDetails from './pages/CourseDetails'
import EditCourse from './pages/EditCourse'

const App = () => {
  const { user, login, logout } = useContext(AuthContext)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Close sidebar
  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  // Close sidebar with Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && sidebarOpen) {
        closeSidebar()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [sidebarOpen])

  return (
    <div className="app">
      <Nav onToggleSidebar={toggleSidebar} onCloseSidebar={closeSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/add-user" element={<AddUser />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="/activate-account" element={<ActivateAccount />} />
          <Route path="/courses" element={<CoursesList />} />
          <Route path="/add-course" element={<AddCourse />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/edit-course/:id" element={<EditCourse />} />

          {/* <Route path="/profile" element={<Profile />} /> */}
        </Routes>
      </div>
    </div>
  )
}

export default App