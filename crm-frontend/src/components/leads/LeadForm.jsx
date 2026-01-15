import { useState, useEffect, useRef } from 'react';
import { leadsAPI } from '../../services/api';

const LeadForm = ({ lead, users = [], currentUser, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'Website',
    status: 'New',
    assignedTo: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const errorRef = useRef(null);

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        source: lead.source || 'Website',
        status: lead.status || 'New',
        assignedTo: lead.assignedTo?._id || lead.assignedTo || '',
        notes: lead.notes || '',
      });
    } else {
      // When creating new lead, default to current user
      setFormData(prev => ({
        ...prev,
        assignedTo: currentUser?._id || currentUser?.id || '',
      }));
    }
  }, [lead, currentUser]);

  // Scroll to error message when it appears
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, [error]);

  const handleChange = (e) => {
    let value = e.target.value;
    
    // Phone number validation - limit to 15 characters and only allow numbers, spaces, +, -, (, )
    if (e.target.name === 'phone') {
      value = value.replace(/[^\d\s+()-]/g, ''); // Remove invalid characters
      if(value.trim() === '') {
        value = '';
      }
      if (value.length > 15) {
        value = value.slice(0, 15); // Limit to 15 characters
      }
    }
    
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name || !formData.email || !formData.phone || !formData.source) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Validate phone number - must have at least 7 digits (minimum for a valid phone number)
    const phoneDigits = formData.phone.replace(/\D/g, ''); // Extract only digits
    if (phoneDigits.length === 0) {
      setError('Phone number must contain at least one digit');
      setLoading(false);
      return;
    }
    if (phoneDigits.length < 7) {
      setError('Phone number must contain at least 7 digits');
      setLoading(false);
      return;
    }
    if (phoneDigits.length > 15) {
      setError('Phone number cannot exceed 15 digits');
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        ...formData,
        // Send assignedTo only if selected, otherwise backend will default to current user
        assignedTo: formData.assignedTo || undefined,
      };
      
      if (lead) {
        await leadsAPI.update(lead._id, submitData);
      } else {
        await leadsAPI.create(submitData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save lead');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      {error && (
        <div ref={errorRef} className="error-message" style={{ scrollMarginTop: '20px' }}>
          {error}
        </div>
      )}
      
      <div className="form-group">
        <label>Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
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
        />
      </div>

      <div className="form-group">
        <label>Phone *</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          maxLength={15}
          pattern=".*\d.*"
          placeholder="e.g., +1 234 567 8900"
          required
        />
        <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
          Must contain at least 7 digits. Maximum 15 characters (numbers, spaces, +, -, parentheses)
        </small>
      </div>

      <div className="form-group">
        <label>Company</label>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Source *</label>
        <select
          name="source"
          value={formData.source}
          onChange={handleChange}
          required
        >
          <option value="Website">Website</option>
          <option value="Referral">Referral</option>
          <option value="Cold Call">Cold Call</option>
          <option value="Social Media">Social Media</option>
        </select>
      </div>

      <div className="form-group">
        <label>Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Converted">Converted</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      <div className="form-group">
        <label>Assigned To</label>
        <select
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleChange}
          disabled={lead && currentUser?.role !== 'Admin'}
        >
          <option value="">Unassigned (will assign to you)</option>
          {currentUser?.role === 'Admin' && users.length > 0 ? (
            users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} {user.role === 'Admin' ? '(Admin)' : ''}
                {(currentUser?._id || currentUser?.id) === user._id ? ' (You)' : ''}
              </option>
            ))
          ) : (
            currentUser && (
              <option value={currentUser._id || currentUser.id}>
                {currentUser.name} (You)
              </option>
            )
          )}
        </select>
        <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
          {currentUser?.role === 'Admin'
            ? 'Select a team member to assign this lead to. Leave unassigned to assign to yourself.'
            : 'Lead will be assigned to you. Only Admins can assign leads to other users.'}
        </small>
        {lead && currentUser?.role !== 'Admin' && (
          <small style={{ color: '#e74c3c', fontSize: '12px', marginTop: '5px', display: 'block' }}>
            ⚠️ You cannot change the assignment for this lead. Only Admins can reassign leads.
          </small>
        )}
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="4"
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : lead ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default LeadForm;

