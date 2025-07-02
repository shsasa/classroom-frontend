import React from 'react'
import PropTypes from 'prop-types'

const StatusBadge = ({
  status,
  variant = 'default',
  size = 'medium'
}) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'success':
        return 'success'
      case 'inactive':
      case 'disabled':
      case 'cancelled':
        return 'danger'
      case 'pending':
      case 'upcoming':
      case 'warning':
        return 'warning'
      case 'draft':
      case 'in-progress':
        return 'info'
      default:
        return 'secondary'
    }
  }

  const statusColor = variant === 'default' ? getStatusColor(status) : variant
  const badgeClass = `status-badge status-badge--${statusColor} status-badge--${size}`

  return (
    <span className={badgeClass}>
      {status}
    </span>
  )
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'success', 'danger', 'warning', 'info']),
  size: PropTypes.oneOf(['small', 'medium', 'large'])
}

export default StatusBadge
