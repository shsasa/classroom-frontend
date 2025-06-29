import React, { useState, useEffect } from 'react';
import { useSearchParams, Navigate, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/ResetPassword.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Check if user is already logged in
  const authToken = localStorage.getItem('token');

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Invalid reset link. No token provided.');
        setVerifying(false);
        return;
      }

      try {
        const response = await api.get(`/users/reset-password/verify?token=${token}`);

        if (response.data.status === 'Success') {
          setTokenValid(true);
          setUserInfo(response.data.user);
        } else {
          setError(response.data.msg || 'Invalid or expired reset token.');
        }
      } catch (error) {
        console.error('Token verification error:', error);
        setError(
          error.response?.data?.msg ||
          'Invalid or expired reset token.'
        );
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  // If user is already logged in, redirect to dashboard
  if (authToken) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.newPassword) {
      setError('Please enter a new password');
      return false;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/users/reset-password', {
        token,
        newPassword: formData.newPassword
      });

      if (response.data.status === 'Success') {
        setMessage(response.data.msg);
        setResetSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.data.msg || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError(
        error.response?.data?.msg ||
        'Failed to reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading state while verifying token
  if (verifying) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="loading-spinner"></div>
          <h2>Verifying Reset Link...</h2>
          <p>Please wait while we verify your password reset link.</p>
        </div>
      </div>
    );
  }

  // Success state
  if (resetSuccess) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="success-icon">✅</div>
          <h2>Password Reset Successful</h2>
          <p className="success-message">
            Your password has been reset successfully!
          </p>
          <p className="instruction">
            You will be redirected to the login page in a few seconds...
          </p>
          <button
            onClick={() => navigate('/login')}
            className="login-btn"
          >
            Go to Login Now
          </button>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="error-icon">❌</div>
          <h2>Invalid Reset Link</h2>
          <p className="error-message">{error}</p>
          <p className="instruction">
            The password reset link may have expired or is invalid.
            Please request a new password reset.
          </p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="forgot-btn"
          >
            Request New Reset Link
          </button>
          <div className="back-to-login">
            <a href="/login">Back to Login</a>
          </div>
        </div>
      </div>
    );
  }

  // Reset form state
  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Reset Your Password</h2>
        {userInfo && (
          <p className="user-info">
            Resetting password for: <strong>{userInfo.name}</strong> ({userInfo.email})
          </p>
        )}
        <p className="instruction">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="Enter your new password"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your new password"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="back-to-login">
          <a href="/login">Back to Login</a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
