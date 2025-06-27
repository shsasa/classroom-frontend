import { createContext, useState, useEffect } from 'react'

const AuthContext = createContext()

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [isLoggedIn, setIsLoggedIn] = useState(!!user)

  const login = (data) => {
    setUser(data)
    setIsLoggedIn(true)
    localStorage.setItem('user', JSON.stringify(data))
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsLoggedIn(false)
  }

  useEffect(() => {
    setIsLoggedIn(!!user)
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }, [user])

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthProvider, AuthContext }