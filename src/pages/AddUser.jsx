import React, { useState } from 'react';
import '../styles/AddUser.css';

const AddUser = () => {
  const initialState = {
    name: '',
    email: '',
    password: '',
    role: 'student',
  };
  const [formValues, setFormValues] = useState(initialState);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would send the data to the backend
    setSuccess(true);
    setFormValues(initialState);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="adduser-container">
      <h2 className="adduser-title">Add New User</h2>
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
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formValues.password}
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
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" disabled={!(formValues.name && formValues.email && formValues.password)}>
          Add User
        </button>
        {success && <p style={{ color: '#b71c1c', marginTop: '1rem' }}>User added successfully!</p>}
      </form>
    </div>
  );
};

export default AddUser;
