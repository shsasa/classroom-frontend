import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('❌ ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h2 style={{ color: '#dc3545', marginBottom: '15px' }}>
            ⚠️ Something went wrong
          </h2>
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>
            An error occurred while rendering this component. Please refresh the page or try again later.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <details style={{
              textAlign: 'left',
              backgroundColor: '#f1f3f4',
              padding: '10px',
              borderRadius: '4px',
              marginTop: '15px'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Error Details (Development Only)
              </summary>
              <pre style={{
                fontSize: '12px',
                overflow: 'auto',
                marginTop: '10px',
                color: '#dc3545'
              }}>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '15px'
            }}
          >
            🔄 Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
