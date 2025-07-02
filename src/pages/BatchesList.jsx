import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { BatchesGrid, BatchesHeader, EmptyBatches } from '../components/batches';
import { LoadingSpinner } from '../components/common';
import '../styles/BatchesList.css';

const BatchesList = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Get user role safely
  const userRole = user?.role;
  const canManageBatches = ['admin', 'supervisor'].includes(userRole);

  useEffect(() => {
    const loadBatches = async () => {
      // Don't fetch if user is not logged in
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let endpoint = '/batches';

        // Choose endpoint based on user role
        if (userRole === 'teacher') {
          endpoint = '/batches/teacher/my-batches';
        } else if (userRole === 'student') {
          endpoint = '/batches/student/my-batches';
        }

        const response = await api.get(endpoint);
        setBatches(response.data || []);
      } catch (error) {
        console.error('Error fetching batches:', error);
        setError('Failed to fetch batches');
        toast.error('Failed to fetch batches');
      } finally {
        setLoading(false);
      }
    };

    loadBatches();
  }, [userRole, user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) {
      return;
    }

    try {
      await api.delete(`/batches/${id}`);
      toast.success('Batch deleted successfully');
      // Refresh the list
      const response = await api.get('/batches');
      setBatches(response.data || []);
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast.error('Failed to delete batch');
    }
  };

  if (loading) {
    return (
      <div className="batches-container">
        <LoadingSpinner message="Loading batches..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="batches-container">
        <div className="error">Please log in to view batches.</div>
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
        canManageBatches={canManageBatches}
        onAddBatch={() => navigate('/batches/add')}
      />

      {batches.length === 0 ? (
        <EmptyBatches
          userRole={userRole}
          canManageBatches={canManageBatches}
          onAddBatch={() => navigate('/batches/add')}
        />
      ) : (
        <BatchesGrid
          batches={batches}
          canManageBatches={canManageBatches}
          onViewBatch={(id) => navigate(`/batches/${id}`)}
          onEditBatch={(id) => navigate(`/batches/edit/${id}`)}
          onDeleteBatch={handleDelete}
        />
      )}
    </div>
  );
};

export default BatchesList;
