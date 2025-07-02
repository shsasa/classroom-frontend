import React from 'react'
import PropTypes from 'prop-types'

const SearchBox = ({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  showClearButton = true,
  disabled = false
}) => {
  const handleClear = () => {
    if (onClear) {
      onClear()
    } else if (onChange) {
      onChange({ target: { value: '' } })
    }
  }

  return (
    <div className="search-box">
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />
        <span className="search-icon">🔍</span>
        {showClearButton && value && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={handleClear}
            disabled={disabled}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

SearchBox.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  onClear: PropTypes.func,
  showClearButton: PropTypes.bool,
  disabled: PropTypes.bool
}

export default SearchBox
