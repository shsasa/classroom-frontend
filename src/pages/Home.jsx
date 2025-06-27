import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import '../styles/Home.css'

const Home = () => {
  const { user } = useContext(AuthContext)

  return (
    <div className="home-container">
      <h1>Welcome to the Classroom Management Platform</h1>
      {user ? (
        <p>Hello, {user.name || user.email} 👋</p>
      ) : (
        <p>Please sign in to access all features.</p>
      )}
    </div>
  )
}

export default Home
