import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import Modal from '../common/Modal';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Sales User',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await usersAPI.getAll();
      setUsers(response.data.data || response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to fetch users. Please check your connection.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    setError(''); // Clear any previous errors
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'Sales User',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'Sales User',
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setSubmitting(true);
    
    try {
      if (editingUser) {
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await usersAPI.update(editingUser._id, updateData);
      } else {
        await usersAPI.create(formData);
      }
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to save user. Please check your connection and try again.';
      setError(errorMessage);
      // Keep modal open so user can see the error and try again
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const userToDelete = users.find(u => u._id === id);
    const confirmMessage = userToDelete?.role === 'Admin' 
      ? 'Are you sure you want to delete this admin? This action cannot be undone.'
      : 'Are you sure you want to delete this user?';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    try {
      await usersAPI.delete(id);
      fetchUsers();
      setError(''); // Clear any previous errors
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete user';
      setError(errorMessage);
      console.error('Delete error:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <h2>User Management</h2>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          + Add New User
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role.toLowerCase().replace(' ', '-')}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-secondary"
                        onClick={() => handleOpenModal(user)}
                      >
                        Edit
                      </button>
                      {(() => {
                        const adminCount = users.filter(u => u.role === 'Admin').length;
                        const isLastAdmin = user.role === 'Admin' && adminCount === 1;
                        return (
                          <button
                            className="btn-danger"
                            onClick={() => handleDelete(user._id)}
                            disabled={isLastAdmin}
                            title={isLastAdmin ? 'Cannot delete the last admin. At least one admin must remain.' : ''}
                          >
                            Delete
                          </button>
                        );
                      })()}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        {error && (
          <div className="error-message" style={{ marginBottom: '20px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label>Password {editingUser ? '(leave blank to keep current)' : '*'}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!editingUser}
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label>Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="Sales User">Sales User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleCloseModal}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
              </button>
            </div>
          </form>
      </Modal>
    </div>
  );
};

export default UserManagement;

