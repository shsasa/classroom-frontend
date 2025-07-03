import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { BatchesGrid, BatchesHeader, EmptyBatches } from '../components/batches';
import { LoadingSpinner } from '../components/common';
import '../styles/BatchesList.css';

const TeacherBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Get teacher info
  const userRole = user?.role;
  const isTeacher = userRole === 'teacher';

  useEffect(() => {
    const loadMyBatches = async () => {
      if (!user || !isTeacher) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch batches where teacher is assigned
        const response = await api.get('/batches/teacher/my-batches');
        setBatches(response.data || []);
      } catch (error) {
        console.error('Error fetching teacher batches:', error);
        setError('Failed to fetch your batches');
        toast.error('Failed to fetch your batches');
      } finally {
        setLoading(false);
      }
    };

    loadMyBatches();
  }, [user, isTeacher]);

  if (loading) {
    return (
      <div className="batches-container">
        <LoadingSpinner message="Loading your batches..." />
      </div>
    );
  }

  if (!user || !isTeacher) {
    return (
      <div className="batches-container">
        <div className="error">
          <div className="error-icon">⚠️</div>
          <h3>Access Denied</h3>
          <p>This page is only accessible to teachers.</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="batches-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="batches-container">
      <BatchesHeader
        userRole={userRole}
        canManageBatches={false}
        onAddBatch={() => { }}
      />

      {batches.length === 0 ? (
        <EmptyBatches
          userRole={userRole}
          canManageBatches={false}
          onAddBatch={() => { }}
        />
      ) : (
        <BatchesGrid
          batches={batches}
          canManageBatches={false}
          onViewBatch={(id) => navigate(`/teacher/batches/${id}`)}
          onEditBatch={() => { }}
          onDeleteBatch={() => { }}
        />
      )}
    </div>
  );
};

export default TeacherBatches;
