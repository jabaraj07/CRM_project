import { useState, useEffect, useRef } from 'react';
import { dealsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DealForm = ({ deal, customers, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    customer: '',
    stage: 'Prospecting',
    probability: 0,
    expectedCloseDate: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const errorRef = useRef(null);

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || '',
        value: deal.value || '',
        customer: deal.customer?._id || deal.customer || '',
        stage: deal.stage || 'Prospecting',
        probability: deal.probability || 0,
        expectedCloseDate: deal.expectedCloseDate
          ? new Date(deal.expectedCloseDate).toISOString().split('T')[0]
          : '',
        notes: deal.notes || '',
      });
    }
  }, [deal]);

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
    
    // Prevent values less than 1 and limit decimal places for deal value
    if (e.target.name === 'value') {
      // Allow empty value for typing
      if (value === '') {
        setFormData({
          ...formData,
          [e.target.name]: value,
        });
        setError('');
        return;
      }
      
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        return; // Don't update if invalid or negative
      }
      
      // Prevent 0 or values less than 1
      if (numValue > 0 && numValue < 1) {
        return; // Don't allow values between 0 and 1
      }
      
      // Limit to 2 decimal places
      if (value.includes('.')) {
        const parts = value.split('.');
        if (parts[1] && parts[1].length > 2) {
          value = parts[0] + '.' + parts[1].slice(0, 2);
        }
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

    if (!formData.title || formData.value === '' || formData.value === null || !formData.customer) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Validate that value is a valid number and at least $1
    const dealValue = parseFloat(formData.value);
    if (isNaN(dealValue)) {
      setError('Deal value must be a valid number');
      setLoading(false);
      return;
    }
    if (dealValue < 1) {
      setError('Deal value must be at least $1.00');
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        ...formData,
        value: dealValue,
        probability: parseInt(formData.probability) || 0,
      };

      if (deal) {
        await dealsAPI.update(deal._id, submitData);
      } else {
        await dealsAPI.create(submitData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save deal');
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
        <label>Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Value ($) *</label>
        <input
          type="number"
          name="value"
          value={formData.value}
          onChange={handleChange}
          onKeyDown={(e) => {
            // Prevent negative sign, minus key, and scientific notation
            if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
              e.preventDefault();
            }
          }}
          min="1"
          step="0.01"
          required
        />
        <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
          Enter a positive amount (minimum: $1, maximum 2 decimal places)
        </small>
      </div>

      <div className="form-group">
        <label>Customer *</label>
        <select
          name="customer"
          value={formData.customer}
          onChange={handleChange}
          required
        >
          <option value="">Select a customer</option>
          {customers.map((customer) => (
            <option key={customer._id} value={customer._id}>
              {customer.name} {customer.company ? `- ${customer.company}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Stage</label>
        <select
          name="stage"
          value={formData.stage}
          onChange={handleChange}
          disabled={
            deal &&
            (deal.stage === 'Closed Won' || deal.stage === 'Closed Lost') &&
            user?.role !== 'Admin'
          }
        >
          <option value="Prospecting">Prospecting</option>
          <option value="Qualification">Qualification</option>
          <option value="Proposal">Proposal</option>
          <option value="Negotiation">Negotiation</option>
          <option value="Closed Won">Closed Won</option>
          <option value="Closed Lost">Closed Lost</option>
        </select>
        {deal &&
          (deal.stage === 'Closed Won' || deal.stage === 'Closed Lost') &&
          user?.role !== 'Admin' && (
            <small style={{ color: '#e74c3c', fontSize: '12px', marginTop: '5px', display: 'block' }}>
              ⚠️ This deal is closed and cannot be edited. Only Admins can make corrections.
            </small>
          )}
      </div>

      <div className="form-group">
        <label>Probability (%)</label>
        <input
          type="number"
          name="probability"
          value={formData.probability}
          onChange={handleChange}
          min="0"
          max="100"
        />
      </div>

      <div className="form-group">
        <label>Expected Close Date</label>
        <input
          type="date"
          name="expectedCloseDate"
          value={formData.expectedCloseDate}
          onChange={handleChange}
        />
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

      {deal &&
        (deal.stage === 'Closed Won' || deal.stage === 'Closed Lost') &&
        user?.role !== 'Admin' && (
          <div style={{
            padding: '15px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '5px',
            marginBottom: '15px',
            color: '#856404'
          }}>
            <strong>⚠️ Warning:</strong> This deal is closed. Only Admins can edit closed deals for corrections.
          </div>
        )}

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={
            loading ||
            (deal &&
              (deal.stage === 'Closed Won' || deal.stage === 'Closed Lost') &&
              user?.role !== 'Admin')
          }
        >
          {loading ? 'Saving...' : deal ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default DealForm;

