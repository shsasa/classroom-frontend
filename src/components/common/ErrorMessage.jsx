import React from 'react'
import PropTypes from 'prop-types'

const ErrorMessage = ({ 
  message, 
  onRetry, 
  showRetry = true,
  icon = '⚠️' 
}) => {
  return (
    <div className="error-message">
      <div className="error-icon">{icon}</div>
      <h3>Something went wrong</h3>
      <p>{message || 'An unexpected error occurred. Please try again.'}</p>
      {showRetry && onRetry && (
        <button 
          className="retry-btn"
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  )
}

ErrorMessage.propTypes = {
  message: PropTypes.string,
  onRetry: PropTypes.func,
  showRetry: PropTypes.bool,
  icon: PropTypes.string
}

ErrorMessage.defaultProps = {
  message: '',
  onRetry: null,
  showRetry: true,
  icon: '⚠️'
}

export default ErrorMessage
