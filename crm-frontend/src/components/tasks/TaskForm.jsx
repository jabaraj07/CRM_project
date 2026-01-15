import { useState, useEffect } from 'react';
import { tasksAPI } from '../../services/api';

const TaskForm = ({ task, leads, customers, deals, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Call',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '',
    relatedTo: 'Lead',
    relatedId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        type: task.type || 'Call',
        priority: task.priority || 'Medium',
        status: task.status || 'Pending',
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split('T')[0]
          : '',
        relatedTo: task.relatedTo || 'Lead',
        relatedId: task.relatedId || '',
      });
    }
  }, [task]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.title || !formData.type || !formData.dueDate || !formData.relatedId) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      if (task) {
        await tasksAPI.update(task._id, formData);
      } else {
        await tasksAPI.create(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
      setLoading(false);
    }
  };

  const getRelatedOptions = () => {
    if (formData.relatedTo === 'Lead') {
      return leads.map((lead) => (
        <option key={lead._id} value={lead._id}>
          {lead.name} {lead.company ? `- ${lead.company}` : ''}
        </option>
      ));
    } else if (formData.relatedTo === 'Customer') {
      return customers.map((customer) => (
        <option key={customer._id} value={customer._id}>
          {customer.name} {customer.company ? `- ${customer.company}` : ''}
        </option>
      ));
    } else if (formData.relatedTo === 'Deal') {
      return deals.map((deal) => (
        <option key={deal._id} value={deal._id}>
          {deal.title} - ${deal.value.toLocaleString()}
        </option>
      ));
    }
    return [];
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <div className="error-message">{error}</div>}

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
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
        />
      </div>

      <div className="form-group">
        <label>Type *</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        >
          <option value="Call">Call</option>
          <option value="Email">Email</option>
          <option value="Meeting">Meeting</option>
          <option value="Follow-up">Follow-up</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label>Priority</label>
        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <div className="form-group">
        <label>Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="form-group">
        <label>Due Date *</label>
        <input
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Related To *</label>
        <select
          name="relatedTo"
          value={formData.relatedTo}
          onChange={(e) => {
            setFormData({
              ...formData,
              relatedTo: e.target.value,
              relatedId: '',
            });
          }}
          required
        >
          <option value="Lead">Lead</option>
          <option value="Customer">Customer</option>
          <option value="Deal">Deal</option>
        </select>
      </div>

      <div className="form-group">
        <label>Select {formData.relatedTo} *</label>
        <select
          name="relatedId"
          value={formData.relatedId}
          onChange={handleChange}
          required
        >
          <option value="">Select a {formData.relatedTo}</option>
          {getRelatedOptions()}
        </select>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : task ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;

