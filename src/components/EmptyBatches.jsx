import React from 'react'
import PropTypes from 'prop-types'

const EmptyBatches = ({
  userRole,
  canManageBatches,
  onAddBatch
}) => {
  const getTitle = () => {
    return 'No Batches Found'
  }

  const getMessage = () => {
    switch (userRole) {
      case 'teacher':
        return 'You are not assigned to any batches yet.'
      case 'student':
        return 'You are not enrolled in any batches yet.'
      default:
        return 'There are no batches created yet.'
    }
  }

  return (
    <div className="no-batches">
      <div className="empty-icon">🎓</div>
      <h3>{getTitle()}</h3>
      <p>{getMessage()}</p>
      {canManageBatches && (
        <button
          className="add-first-batch-btn"
          onClick={onAddBatch}
        >
          Create First Batch
        </button>
      )}
    </div>
  )
}

EmptyBatches.propTypes = {
  userRole: PropTypes.string,
  canManageBatches: PropTypes.bool,
  onAddBatch: PropTypes.func
}

EmptyBatches.defaultProps = {
  userRole: 'student',
  canManageBatches: false,
  onAddBatch: () => { }
}

export default EmptyBatches
