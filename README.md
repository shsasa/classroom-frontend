# 🎓 Classroom Manager - Frontend

The frontend application for a comprehensive classroom management system built with React.js. This application provides an intuitive interface for educational institutions to manage users, courses, assignments, and student progress efficiently.

> **Note**: This is the frontend repository. The backend API is located in a separate repository.

## ✨ Features

### 👥 User Management Interface
- **Multiple User Roles**: Admin, Supervisor, Teacher, Student dashboards
- **Account Activation**: User-friendly account activation process
- **Role-based Navigation**: Different UI elements based on user permissions
- **User Profile Management**: Complete user information and avatar support

### 📚 Course Management Interface
- **Course Dashboard**: View and manage courses with intuitive interface
- **Teacher Assignment**: Easy teacher assignment interface
- **File Management**: Upload and manage course materials
- **Batch Integration**: Visual course-to-batch linking

### 🎯 Academic Features Interface
- **Assignment Dashboard**: Create, assign, and track assignments
- **Submission Portal**: Student-friendly assignment submission interface
- **Attendance Interface**: Easy attendance recording and monitoring
- **Announcements**: Broadcast and view important information
- **Batch Management**: Visual batch organization with schedules

### 🖥️ User Interface Features
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Sidebar Navigation**: Collapsible sidebar with role-based menu items
- **Modern UI**: Clean and intuitive interface with elegant red theme
- **Search & Filter**: Advanced filtering with debounced search functionality
- **Real-time Updates**: Dynamic content updates without page refresh

## 🛠️ Technology Stack

### Frontend Technologies
- **React.js** - User interface framework
- **React Router** - Client-side routing and navigation
- **React Context** - State management for authentication
- **CSS3** - Modern styling with custom themes
- **Fetch API** - HTTP client for API communication

### Development Tools
- **ESLint** - Code linting and formatting
- **npm/yarn** - Package management
- **VS Code** - Recommended development environment

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Backend API server running (see backend repository)

### Backend Setup
This frontend application requires the backend API to be running. Please clone and set up the backend repository separately:
- Backend Repository: `<backend-repository-url>`
- Follow the backend README instructions for setup
- Ensure the backend is running before starting the frontend

## 👤 Default Login Credentials

After running the database seeder:

- **Admin**: `admin@school.com` / `admin123`
- **Supervisor**: `supervisor@school.com` / `super123`
- **Teacher**: `khaled.math@school.com` / `teacher123`
- **Student**: `ali.student@school.com` / `student123`

## 🔑 Key Features Details

### Role-Based Access
- **Admin**: Full system access, user management, system configuration
- **Supervisor**: User oversight, course management, reporting
- **Teacher**: Course content, assignments, student progress
- **Student**: Course access, assignment submission, progress viewing

### Course Management
- Create and manage courses with detailed information
- Assign teachers and link to student batches
- Upload and manage course materials
- Track course progress and statistics

### Assignment System
- Create assignments with due dates and instructions
- Support for file attachments and multimedia content
- Student submission portal with file upload
- Grading and feedback system

## 🌟 Upcoming Features

- [ ] Real-time notifications using WebSocket
- [ ] Mobile-responsive improvements
- [ ] Advanced reporting dashboard
- [ ] Dark/Light theme toggle
- [ ] Offline support with PWA
- [ ] Enhanced accessibility features
- [ ] Multi-language support (i18n)

## Built with ❤️ for educational institutions worldwide
