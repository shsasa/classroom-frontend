import React, { useState } from 'react';
import Client from '../services/api';
import { toast } from 'react-toastify';
import '../styles/AddUser.css';

const AddUser = () => {
  const initialState = {
    name: '',
    email: '',
    role: 'student',
  };
  const [formValues, setFormValues] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await Client.post('/auth/add-user', formValues);
      toast.success('User added successfully! They will receive an email to set their password.');
      setFormValues(initialState);
    } catch (error) {
      if (error.response?.data?.msg) {
        toast.error(error.response.data.msg);
      } else {
        toast.error('Failed to add user. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adduser-container">
      <h2 className="adduser-title">Add New User</h2>
      <p className="adduser-description">
        Create a new user account. The user will receive an activation link to set their password.
      </p>
      <form onSubmit={handleSubmit} autoComplete="on">
        <div className="input-wrapper">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formValues.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-wrapper">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formValues.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-wrapper">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={formValues.role}
            onChange={handleChange}
            required
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="supervisor">Supervisor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" disabled={!(formValues.name && formValues.email) || loading}>
          {loading ? 'Adding User...' : 'Add User'}
        </button>
      </form>
    </div>
  );
};

export default AddUser;
