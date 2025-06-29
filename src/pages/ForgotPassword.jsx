import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // If user is already logged in, redirect to home
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/users/forgot-password', { email });

      if (response.data.status === 'Success') {
        setMessage(response.data.msg);
        setEmailSent(true);
      } else {
        setError(response.data.msg || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(
        error.response?.data?.msg ||
        'Failed to send reset email. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="success-icon">✉️</div>
          <h2>Check Your Email</h2>
          <p className="success-message">
            If an account with that email exists, we've sent you a password reset link.
          </p>
          <p className="instruction">
            Please check your email and click the link to reset your password.
            The link will expire in 1 hour.
          </p>
          <button
            onClick={() => {
              setEmailSent(false);
              setEmail('');
              setMessage('');
            }}
            className="resend-btn"
          >
            Send Another Email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Forgot Password</h2>
        <p className="instruction">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="back-to-login">
          <a href="/signin">Back to Login</a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
