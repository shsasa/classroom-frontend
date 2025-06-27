import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { resetPassword } from '../services/users'
import { toast } from 'react-toastify'
import '../styles/ResetPassword.css'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    resetToken: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Enter token, 2: Set password
  const urlToken = searchParams.get('token')

  useEffect(() => {
    // If token is provided in URL, set it and go to step 2
    if (urlToken) {
      setFormData(prev => ({ ...prev, resetToken: urlToken }))
      setStep(2)
    }
  }, [urlToken])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Step 1: Verify token
    if (step === 1) {
      if (!formData.resetToken.trim()) {
        toast.error('Please enter reset token')
        return
      }

      // Move to password setting step
      setStep(2)
      return
    }

    // Step 2: Reset password
    if (!formData.resetToken.trim()) {
      toast.error('Reset token is required')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    try {
      await resetPassword(formData.resetToken, formData.password)
      toast.success('Password has been reset successfully!')
      navigate('/signin', {
        state: {
          message: 'Password reset successful. You can now log in with your new password.'
        }
      })
    } catch (error) {
      console.error('Error resetting password:', error)
      if (error.response?.status === 400) {
        toast.error('Invalid or expired reset token')
        setStep(1) // Go back to token entry
      } else {
        toast.error('Failed to reset password. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <h2>Reset Your Password</h2>
          <p>
            {step === 1
              ? 'Enter the reset token provided by your administrator'
              : 'Enter your new password below'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          {step === 1 && (
            <div className="form-group">
              <label htmlFor="resetToken">Reset Token</label>
              <input
                type="text"
                id="resetToken"
                name="resetToken"
                value={formData.resetToken}
                onChange={handleChange}
                required
                placeholder="Enter reset token"
                disabled={loading}
              />
            </div>
          )}

          {step === 2 && (
            <>
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Enter new password"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Confirm new password"
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || (step === 1 && !formData.resetToken) || (step === 2 && (!formData.password || !formData.confirmPassword))}
            >
              {loading
                ? (step === 1 ? 'Verifying...' : 'Resetting...')
                : (step === 1 ? 'Verify Token' : 'Reset Password')
              }
            </button>

            {step === 2 && (
              <button
                type="button"
                className="back-btn"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back to Token Entry
              </button>
            )}

            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/signin')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
