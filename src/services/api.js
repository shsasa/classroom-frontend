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
    // Reads the token in localStorage
    const token = localStorage.getItem('token')

    // if the token exists, we set the authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    // We return the new config if the token exists or the default config if no token exists.
    return config
    // Provides the token to each request that passes through axios
  },
  async (error) => {
    throw error
  }
)


export default Client