import React from 'react'
import PropTypes from 'prop-types'

const BatchesHeader = ({
  userRole,
  canManageBatches,
  onAddBatch
}) => {
  const getTitle = () => {
    switch (userRole) {
      case 'teacher':
        return 'My Batches'
      case 'student':
        return 'My Batches'
      default:
        return 'Batches Management'
    }
  }

  const getDescription = () => {
    switch (userRole) {
      case 'teacher':
        return 'Batches you are teaching or supervising'
      case 'student':
        return 'Batches you are enrolled in'
      default:
        return 'Manage student batches, schedules, and enrollments'
    }
  }

  return (
    <div className="batches-header">
      <div className="batches-header-content">
        <h1>{getTitle()}</h1>
        <p>{getDescription()}</p>
      </div>
      {canManageBatches && (
        <button
          className="add-batch-btn"
          onClick={onAddBatch}
        >
          <span className="btn-icon">➕</span>
          Add New Batch
        </button>
      )}
    </div>
  )
}

BatchesHeader.propTypes = {
  userRole: PropTypes.string,
  canManageBatches: PropTypes.bool,
  onAddBatch: PropTypes.func
}

BatchesHeader.defaultProps = {
  userRole: 'student',
  canManageBatches: false,
  onAddBatch: () => { }
}

export default BatchesHeader
