import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { activateAccount } from '../services/users'
import { toast } from 'react-toastify'
import '../styles/ActivateAccount.css'

const ActivateAccount = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    activationToken: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Enter token, 2: Set password
  const urlToken = searchParams.get('token')

  useEffect(() => {
    // If token is provided in URL, set it and go to step 2
    if (urlToken) {
      setFormData(prev => ({ ...prev, activationToken: urlToken }))
      setStep(2)
    }
  }, [urlToken])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Token copied to clipboard!')
    }).catch(() => {
      toast.error('Failed to copy token')
    })
  }

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
      if (!formData.activationToken.trim()) {
        toast.error('Please enter activation token')
        return
      }

      // Move to password setting step
      setStep(2)
      return
    }

    // Step 2: Set password and activate account
    if (!formData.activationToken.trim()) {
      toast.error('Activation token is required')
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
      await activateAccount(formData.activationToken, formData.password)
      toast.success('Account activated successfully! You can now log in.')
      navigate('/signin', {
        state: {
          message: 'Account activated successfully! You can now log in with your new password.'
        }
      })
    } catch (error) {
      console.error('Error activating account:', error)
      if (error.response?.status === 400) {
        toast.error('Invalid or expired activation token')
        setStep(1) // Go back to token entry
      } else {
        toast.error('Failed to activate account. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="activate-account-container">
      <div className="activate-account-card">
        <div className="activate-account-header">
          <h2>Activate Your Account</h2>
          <p>
            {step === 1
              ? 'Enter the activation token provided by your administrator'
              : 'Set your password to complete account activation'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="activate-account-form">
          {step === 1 && (
            <div className="form-group">
              <label htmlFor="activationToken">Activation Token</label>
              <div className="token-input-group">
                <input
                  type="text"
                  id="activationToken"
                  name="activationToken"
                  value={formData.activationToken}
                  onChange={handleChange}
                  required
                  placeholder="Enter activation token"
                  disabled={loading}
                />
                {formData.activationToken && (
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={() => copyToClipboard(formData.activationToken)}
                    title="Copy token"
                  >
                    📋
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <>
              <div className="token-display">
                <span className="token-label">Activation Token:</span>
                <span className="token-value">{formData.activationToken.substring(0, 8)}...</span>
                <button
                  type="button"
                  className="copy-token-btn"
                  onClick={() => copyToClipboard(formData.activationToken)}
                  title="Copy full token"
                >
                  📋
                </button>
              </div>

              <div className="form-group">
                <label htmlFor="password">Create Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || (step === 1 && !formData.activationToken) || (step === 2 && (!formData.password || !formData.confirmPassword))}
            >
              {loading
                ? (step === 1 ? 'Verifying...' : 'Activating...')
                : (step === 1 ? 'Verify Token' : 'Activate Account')
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

export default ActivateAccount
