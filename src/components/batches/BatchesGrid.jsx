import React from 'react'
import PropTypes from 'prop-types'
import BatchCard from './BatchCard'

const BatchesGrid = ({
  batches,
  canManageBatches,
  onViewBatch,
  onEditBatch,
  onDeleteBatch
}) => {
  if (!batches || batches.length === 0) {
    return null
  }

  return (
    <div className="batches-grid">
      {batches.map(batch => (
        <BatchCard
          key={batch._id}
          batch={batch}
          canManageBatches={canManageBatches}
          onView={onViewBatch}
          onEdit={onEditBatch}
          onDelete={onDeleteBatch}
        />
      ))}
    </div>
  )
}

BatchesGrid.propTypes = {
  batches: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired
    })
  ).isRequired,
  canManageBatches: PropTypes.bool,
  onViewBatch: PropTypes.func.isRequired,
  onEditBatch: PropTypes.func,
  onDeleteBatch: PropTypes.func
}

BatchesGrid.defaultProps = {
  canManageBatches: false,
  onEditBatch: () => { },
  onDeleteBatch: () => { }
}

export default BatchesGrid
