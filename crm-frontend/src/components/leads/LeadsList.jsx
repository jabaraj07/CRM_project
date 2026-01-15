import { useState, useEffect } from 'react';
import { leadsAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LeadForm from './LeadForm';
import Modal from '../common/Modal';
import './Leads.css';

const LeadsList = () => {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const { user } = useAuth();

  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch users for assignment (Admins can see all, Sales Users will see limited)
      if (user?.role === 'Admin') {
        const response = await usersAPI.getAll();
        setUsers(response.data.data || response.data);
      }
      // For Sales Users, we'll just use current user info (they can assign to themselves)
      // The backend will handle assignment if not specified
    } catch (err) {
      console.error('Failed to load users:', err);
      // If API fails (e.g., Sales User), that's okay - backend will default assignment
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await leadsAPI.getAll();
      setLeads(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load leads');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingLead(null);
    setShowModal(true);
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadsAPI.delete(id);
        fetchLeads();
      } catch (err) {
        alert('Failed to delete lead');
      }
    }
  };

  const handleConvert = async (id) => {
    if (window.confirm('Convert this lead to a customer?')) {
      try {
        await leadsAPI.convert(id);
        alert('Lead converted to customer successfully!');
        fetchLeads();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to convert lead');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingLead(null);
  };

  const handleFormSubmit = () => {
    handleModalClose();
    fetchLeads();
  };

  const getStatusColor = (status) => {
    const colors = {
      New: '#3498db',
      Contacted: '#f39c12',
      Qualified: '#9b59b6',
      Converted: '#27ae60',
      Lost: '#e74c3c',
    };
    return colors[status] || '#95a5a6';
  };

  const filteredLeads =
    filterStatus === 'All'
      ? leads
      : leads.filter((lead) => lead.status === filterStatus);

  if (loading) {
    return <div className="loading">Loading leads...</div>;
  }

  return (
    <div className="leads-container">
      <div className="page-header">
        <div className="header-actions">
          <button onClick={handleCreate} className="btn-primary">
            + Add New Lead
          </button>
        </div>
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="All">All</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="leads-grid">
        {filteredLeads.length === 0 ? (
          <div className="empty-state">No leads found</div>
        ) : (
          filteredLeads.map((lead) => (
            <div key={lead._id} className="lead-card">
              <div className="lead-header">
                <h3>{lead.name}</h3>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(lead.status) }}
                >
                  {lead.status}
                </span>
              </div>
              <div className="lead-info">
                <p>
                  <strong>Email:</strong> {lead.email}
                </p>
                <p>
                  <strong>Phone:</strong> {lead.phone}
                </p>
                {lead.company && (
                  <p>
                    <strong>Company:</strong> {lead.company}
                  </p>
                )}
                <p>
                  <strong>Source:</strong> {lead.source}
                </p>
                {lead.assignedTo && (
                  <p>
                    <strong>Assigned To:</strong>{' '}
                    {lead.assignedTo.name || 'N/A'}
                  </p>
                )}
                {lead.notes && (
                  <p>
                    <strong>Notes:</strong> {lead.notes}
                  </p>
                )}
              </div>
              <div className="lead-actions">
                <button
                  onClick={() => handleEdit(lead)}
                  className="btn-secondary"
                >
                  Edit
                </button>
                {!lead.convertedToCustomer && (
                  <button
                    onClick={() => handleConvert(lead._id)}
                    className="btn-success"
                  >
                    Convert
                  </button>
                )}
                {user?.role === 'Admin' && (
                  <button
                    onClick={() => handleDelete(lead._id)}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <Modal onClose={handleModalClose} title={editingLead ? 'Edit Lead' : 'Create Lead'}>
          <LeadForm
            lead={editingLead}
            users={users}
            currentUser={user}
            onSuccess={handleFormSubmit}
            onCancel={handleModalClose}
          />
        </Modal>
      )}
    </div>
  );
};

export default LeadsList;

