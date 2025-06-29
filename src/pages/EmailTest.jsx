import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Client from '../services/api';
import { toast } from 'react-toastify';
import '../styles/EmailTest.css';

const EmailTest = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [debugResults, setDebugResults] = useState(null);
  const [customResults, setCustomResults] = useState(null);
  const [testEmailForm, setTestEmailForm] = useState({
    to: '',
    subject: 'Test Email from Classroom Manager',
    message: 'This is a test email to verify SMTP configuration.'
  });
  const [customForm, setCustomForm] = useState({
    host: 'server147.web-hosting.com',
    port: '587',
    secure: 'false',
    user: 'class@shsasa.net',
    pass: '',
    testEmail: ''
  });

  // Check if user is admin or supervisor
  if (!user || !['admin', 'supervisor'].includes(user.role)) {
    return (
      <div className="email-test-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>Only administrators and supervisors can access email testing features.</p>
        </div>
      </div>
    );
  }

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await Client.get('/users/email/test-connection');
      setTestResults(response.data);
      if (response.data.success) {
        toast.success('Email connection test successful!');
      } else {
        toast.error('Email connection test failed!');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setTestResults({ success: false, error: errorMsg });
      toast.error(`Connection test failed: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const runDebugTest = async () => {
    setLoading(true);
    try {
      const response = await Client.post('/users/email/debug-settings', {});
      setDebugResults(response.data);
      toast.success('Debug test completed! Check results below.');
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setDebugResults({ success: false, error: errorMsg });
      toast.error(`Debug test failed: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmailForm.to || !testEmailForm.subject || !testEmailForm.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await Client.post('/users/email/send-test', testEmailForm);
      if (response.data.success) {
        toast.success(`Test email sent successfully to ${testEmailForm.to}!`);
        setTestEmailForm({ ...testEmailForm, to: '' }); // Clear email field
      } else {
        toast.error('Failed to send test email');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      toast.error(`Send test failed: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setTestEmailForm({
      ...testEmailForm,
      [e.target.name]: e.target.value
    });
  };

  const handleCustomInputChange = (e) => {
    setCustomForm({
      ...customForm,
      [e.target.name]: e.target.value
    });
  };

  const testCustomSettings = async () => {
    if (!customForm.host || !customForm.port || !customForm.user || !customForm.pass) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await Client.post('/users/email/test-custom', customForm);
      setCustomResults(response.data);
      if (response.data.success) {
        toast.success('Custom settings test successful!');
      } else {
        toast.error('Custom settings test failed!');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setCustomResults({ success: false, error: errorMsg });
      toast.error(`Custom test failed: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults(null);
    setDebugResults(null);
    setCustomResults(null);
  };

  return (
    <div className="email-test-container">
      <div className="email-test-header">
        <h1>Email Service Testing</h1>
        <p>Test and debug SMTP email configuration</p>
      </div>

      <div className="test-controls">
        <div className="control-section">
          <h3>Quick Tests</h3>
          <div className="button-group">
            <button
              onClick={testConnection}
              disabled={loading}
              className="test-btn primary"
            >
              {loading ? 'Testing...' : 'Test Connection'}
            </button>

            <button
              onClick={runDebugTest}
              disabled={loading}
              className="test-btn secondary"
            >
              {loading ? 'Testing...' : 'Run Debug Test'}
            </button>

            <button
              onClick={clearResults}
              className="test-btn clear"
            >
              Clear Results
            </button>
          </div>
        </div>

        <div className="control-section">
          <h3>Send Test Email</h3>
          <div className="test-email-form">
            <div className="form-group">
              <label htmlFor="to">To Email:</label>
              <input
                type="email"
                id="to"
                name="to"
                value={testEmailForm.to}
                onChange={handleInputChange}
                placeholder="recipient@example.com"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject:</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={testEmailForm.subject}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message:</label>
              <textarea
                id="message"
                name="message"
                value={testEmailForm.message}
                onChange={handleInputChange}
                rows="3"
                disabled={loading}
              />
            </div>

            <button
              onClick={sendTestEmail}
              disabled={loading}
              className="test-btn send"
            >
              {loading ? 'Sending...' : 'Send Test Email'}
            </button>
          </div>
        </div>

        <div className="control-section">
          <h3>Test Custom SMTP Settings</h3>
          <div className="custom-smtp-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="host">SMTP Host:</label>
                <input
                  type="text"
                  id="host"
                  name="host"
                  value={customForm.host}
                  onChange={handleCustomInputChange}
                  placeholder="mail.example.com"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="port">Port:</label>
                <select
                  id="port"
                  name="port"
                  value={customForm.port}
                  onChange={handleCustomInputChange}
                  disabled={loading}
                >
                  <option value="587">587 (TLS)</option>
                  <option value="465">465 (SSL)</option>
                  <option value="25">25 (Plain)</option>
                  <option value="2525">2525 (Alternative)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="secure">Security:</label>
                <select
                  id="secure"
                  name="secure"
                  value={customForm.secure}
                  onChange={handleCustomInputChange}
                  disabled={loading}
                >
                  <option value="false">TLS (STARTTLS)</option>
                  <option value="true">SSL/TLS</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="user">Username/Email:</label>
                <input
                  type="email"
                  id="user"
                  name="user"
                  value={customForm.user}
                  onChange={handleCustomInputChange}
                  placeholder="your-email@domain.com"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="pass">Password:</label>
                <input
                  type="password"
                  id="pass"
                  name="pass"
                  value={customForm.pass}
                  onChange={handleCustomInputChange}
                  placeholder="Your email password"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="testEmail">Test Email Address (optional):</label>
              <input
                type="email"
                id="testEmail"
                name="testEmail"
                value={customForm.testEmail}
                onChange={handleCustomInputChange}
                placeholder="test@example.com"
                disabled={loading}
              />
              <small className="form-help">
                If provided, a test email will be sent to this address
              </small>
            </div>

            <button
              onClick={testCustomSettings}
              disabled={loading}
              className="test-btn custom"
            >
              {loading ? 'Testing...' : 'Test Custom Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="results-section">
          <h3>Connection Test Results</h3>
          <div className={`result-card ${testResults.success ? 'success' : 'error'}`}>
            <div className="result-status">
              <span className={`status-icon ${testResults.success ? 'success' : 'error'}`}>
                {testResults.success ? '✅' : '❌'}
              </span>
              <span className="status-text">
                {testResults.success ? 'Connection Successful' : 'Connection Failed'}
              </span>
            </div>
            {testResults.message && (
              <p className="result-message">{testResults.message}</p>
            )}
            {testResults.error && (
              <p className="result-error">{testResults.error}</p>
            )}
          </div>
        </div>
      )}

      {/* Debug Results */}
      {debugResults && (
        <div className="results-section">
          <h3>Debug Test Results</h3>

          {debugResults.settings && (
            <div className="result-card info">
              <h4>Current Settings</h4>
              <ul>
                <li><strong>Host:</strong> {debugResults.settings.host}</li>
                <li><strong>User:</strong> {debugResults.settings.user}</li>
                <li><strong>Password Set:</strong> {debugResults.settings.passwordSet ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          )}

          {debugResults.results && (
            <div className="debug-results">
              <h4>Port Configuration Tests</h4>
              {debugResults.results.map((result, index) => (
                <div key={index} className={`result-card ${result.success ? 'success' : 'error'}`}>
                  <div className="result-header">
                    <span className={`status-icon ${result.success ? 'success' : 'error'}`}>
                      {result.success ? '✅' : '❌'}
                    </span>
                    <span className="config-name">{result.name}</span>
                  </div>
                  <div className="config-details">
                    <span>Port: {result.port}</span>
                    <span>Secure: {result.secure ? 'Yes' : 'No'}</span>
                  </div>
                  {result.error && (
                    <p className="result-error">{result.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {debugResults.error && (
            <div className="result-card error">
              <p className="result-error">{debugResults.error}</p>
            </div>
          )}
        </div>
      )}

      {/* Custom SMTP Results */}
      {customResults && (
        <div className="results-section">
          <h3>Custom SMTP Test Results</h3>

          <div className={`result-card ${customResults.success ? 'success' : 'error'}`}>
            <div className="result-status">
              <span className={`status-icon ${customResults.success ? 'success' : 'error'}`}>
                {customResults.success ? '✅' : '❌'}
              </span>
              <span className="status-text">
                {customResults.success ? 'Custom SMTP Test Successful' : 'Custom SMTP Test Failed'}
              </span>
            </div>

            {customResults.message && (
              <p className="result-message">{customResults.message}</p>
            )}

            {customResults.settings && (
              <div className="settings-used">
                <h4>Settings Tested:</h4>
                <ul>
                  <li><strong>Host:</strong> {customResults.settings.host}</li>
                  <li><strong>Port:</strong> {customResults.settings.port}</li>
                  <li><strong>Secure:</strong> {customResults.settings.secure}</li>
                  <li><strong>User:</strong> {customResults.settings.user}</li>
                </ul>
              </div>
            )}

            {customResults.connection && (
              <div className="connection-result">
                <h4>Connection Test:</h4>
                <span className={`status-badge ${customResults.connection.success ? 'success' : 'error'}`}>
                  {customResults.connection.success ? 'Connected Successfully' : 'Connection Failed'}
                </span>
              </div>
            )}

            {customResults.email && (
              <div className="email-result">
                <h4>Email Test:</h4>
                {customResults.email.success ? (
                  <div className="email-success">
                    <span className="status-badge success">Email Sent Successfully</span>
                    {customResults.email.messageId && (
                      <p className="message-id">Message ID: {customResults.email.messageId}</p>
                    )}
                  </div>
                ) : (
                  <span className="status-badge error">Email Send Failed</span>
                )}
              </div>
            )}

            {customResults.error && (
              <div className="error-details">
                <h4>Error Details:</h4>
                <p className="result-error">{customResults.error}</p>
                {customResults.code && (
                  <p className="error-code">Error Code: {customResults.code}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTest;
