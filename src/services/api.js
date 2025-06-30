import Axios from 'axios'

export const BASE_URL = 'http://localhost:3000'

// Helper function to create full URLs for uploaded files
export const getFileUrl = (filename) => {
  if (!filename) return null
  return `${BASE_URL}/uploads/${filename}`
}

const Client = Axios.create({
  baseURL: BASE_URL,
})


Client.interceptors.request.use(
  async (config) => {
    console.log('🚀 Axios Request Interceptor - Before:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers
    })

    // Reads the token in localStorage
    const token = localStorage.getItem('token')
    console.log('📱 Token from localStorage:', token ? 'Token exists' : 'No token found')

    // if the token exists, we set the authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
      console.log('🔑 Authorization header set:', config.headers['Authorization'])
    }

    console.log('📤 Final request config:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    })

    // We return the new config if the token exists or the default config if no token exists.
    return config
    // Provides the token to each request that passes through axios
  },
  async (error) => {
    console.log('❌ Axios Interceptor Error!', error)
    throw error
  }
)


export default Client