import React from 'react'
import PropTypes from 'prop-types'

const LoadingSpinner = ({ message }) => {
  return (
    <div className="loading">
      {message || 'Loading...'}
    </div>
  )
}

LoadingSpinner.propTypes = {
  message: PropTypes.string
}

LoadingSpinner.defaultProps = {
  message: 'Loading...'
}

export default LoadingSpinner
