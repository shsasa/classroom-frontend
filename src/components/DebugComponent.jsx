import React, { useState } from 'react';
import api from '../services/api';

const DebugComponent = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (name, endpoint) => {
    try {
      setLoading(true);
      console.log(`🧪 Testing ${name}: ${endpoint}`);
      const response = await api.get(endpoint);
      console.log(`✅ ${name} success:`, response.data);
      setTestResults(prev => ({
        ...prev,
        [name]: { success: true, data: response.data, error: null }
      }));
    } catch (error) {
      console.error(`❌ ${name} failed:`, error);
      setTestResults(prev => ({
        ...prev,
        [name]: {
          success: false,
          data: null,
          error: {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
          }
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestResults({});
    await testEndpoint('Server Health', '/');
    await testEndpoint('Filter Data', '/announcements/filter-data');
    await testEndpoint('Announcements', '/announcements');
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', margin: '20px', borderRadius: '8px' }}>
      <h3>🧪 API Debug Tool</h3>
      <button
        onClick={runAllTests}
        disabled={loading}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? '⏳ Testing...' : '🚀 Run API Tests'}
      </button>

      <div>
        {Object.entries(testResults).map(([name, result]) => (
          <div key={name} style={{
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: result.success ? '#d4edda' : '#f8d7da',
            border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: result.success ? '#155724' : '#721c24' }}>
              {result.success ? '✅' : '❌'} {name}
            </h4>
            {result.success ? (
              <pre style={{ fontSize: '12px', overflow: 'auto', margin: 0 }}>
                {JSON.stringify(result.data, null, 2)}
              </pre>
            ) : (
              <div style={{ fontSize: '14px', color: '#721c24' }}>
                <p><strong>Error:</strong> {result.error?.message}</p>
                {result.error?.status && <p><strong>Status:</strong> {result.error.status}</p>}
                {result.error?.data && (
                  <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                    {JSON.stringify(result.error.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugComponent;
