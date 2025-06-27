import Client from './api'



export const SignInUser = async (data) => {

  const res = await Client.post('/auth/login', data)
  // Set the current signed in users token to localStorage
  localStorage.setItem('token', res.data.token)
  return res.data.user

}

export const CheckSession = async () => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    // Checks if the current token if it exists is valid
    // The interceptor in api.js will automatically add the Authorization header
    const res = await Client.get('/auth/session')
    return res.data
  } catch (error) {
    // If there's an error, clear the token and user from localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    throw error
  }
}