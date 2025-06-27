import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ToastContainer } from 'react-toastify'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.querySelector('#root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </AuthProvider>
  </BrowserRouter>
)