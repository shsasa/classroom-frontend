import './styles/App.css'
import './styles/theme.css'
import { useContext, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router'
import { AuthContext } from './context/AuthContext'
import { CheckSession } from './services/Auth'
import Nav from './components/layout/Nav'
import Sidebar from './components/layout/Sidebar'
import SignIn from './pages/SignIn'
import Home from './pages/Home'
import AddUser from './pages/AddUser'
import UsersList from './pages/UsersList'
import ActivateAccount from './pages/ActivateAccount'
import AddCourse from './pages/AddCourse'
import CoursesList from './pages/CoursesList'
import CourseDetails from './pages/CourseDetails'
import EditCourse from './pages/EditCourse'
import EmailTest from './pages/EmailTest'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AnnouncementsList from './pages/AnnouncementsList'
import AddAnnouncement from './pages/AddAnnouncement'
import EditAnnouncement from './pages/EditAnnouncement'
import AnnouncementDetails from './pages/AnnouncementDetails'
import BatchesList from './pages/BatchesList'
import AddBatch from './pages/AddBatch'
import BatchDetails from './pages/BatchDetails'
import EditBatch from './pages/EditBatch'
import BatchAssignments from './components/BatchAssignments'
import Profile from './pages/Profile'
import StudentBatches from './pages/StudentBatches'
import StudentBatchDetails from './pages/StudentBatchDetails'
import StudentCourses from './pages/StudentCourses'
import StudentCourseDetails from './pages/StudentCourseDetails'
import StudentAssignments from './pages/StudentAssignments'
import StudentAssignmentDetail from './pages/StudentAssignmentDetail'
import TeacherAssignments from './pages/TeacherAssignments'
import TeacherAssignmentDetails from './pages/TeacherAssignmentDetails'
import AttendanceManagement from './pages/AttendanceManagement'
import StudentAttendance from './pages/StudentAttendance'
import TestPage from './pages/TestPage'

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
          <Route path="/announcements" element={<AnnouncementsList />} />
          <Route path="/announcements/add" element={<AddAnnouncement />} />
          <Route path="/announcements/edit/:id" element={<EditAnnouncement />} />
          <Route path="/announcements/:id" element={<AnnouncementDetails />} />
          <Route path="/batches" element={<BatchesList />} />
          <Route path="/batches/add" element={<AddBatch />} />
          <Route path="/batches/:id" element={<BatchDetails />} />
          <Route path="/batches/:id/assignments" element={<BatchAssignments />} />
          <Route path="/batches/edit/:id" element={<EditBatch />} />
          <Route path="/email-test" element={<EmailTest />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/student/batches" element={<StudentBatches />} />
          <Route path="/student/batches/:id" element={<StudentBatchDetails />} />
          <Route path="/student/courses" element={<StudentCourses />} />
          <Route path="/student/courses/:id" element={<StudentCourseDetails />} />
          <Route path="/student/assignments" element={<StudentAssignments />} />
          <Route path="/student/assignments/:id" element={<StudentAssignmentDetail />} />
          <Route path="/student/attendance" element={<StudentAttendance />} />
          <Route path="/teacher/assignments" element={<TeacherAssignments />} />
          <Route path="/teacher/assignments/:id" element={<TeacherAssignmentDetails />} />
          <Route path="/attendance" element={<AttendanceManagement />} />
          <Route path="/test" element={<TestPage />} />

        </Routes>
      </div>
    </div>
  )
}

export default App