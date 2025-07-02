import React from 'react'
import PropTypes from 'prop-types'

const EmptyState = ({ 
  icon = '📂',
  title,
  message,
  actionText,
  onAction,
  showAction = true
}) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {showAction && onAction && actionText && (
        <button 
          className="empty-action-btn"
          onClick={onAction}
        >
          {actionText}
        </button>
      )}
    </div>
  )
}

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  actionText: PropTypes.string,
  onAction: PropTypes.func,
  showAction: PropTypes.bool
}

EmptyState.defaultProps = {
  icon: '📂',
  actionText: '',
  onAction: null,
  showAction: true
}

export default EmptyState
