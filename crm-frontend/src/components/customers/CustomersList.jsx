import { useState, useEffect } from 'react';
import { customersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CustomerForm from './CustomerForm';
import Modal from '../common/Modal';
import './Customers.css';

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customersAPI.getAll();
      setCustomers(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const customer = customers.find(c => c._id === id);
    
    // Check if customer has deals or revenue
    const hasDeals = customer && (customer.totalDeals > 0);
    const hasRevenue = customer && (customer.totalRevenue > 0);
    
    if (hasDeals || hasRevenue) {
      const confirmMessage = 
        `⚠️ WARNING: Cannot delete this customer!\n\n` +
        `This customer has:\n` +
        `${hasDeals ? `• ${customer.totalDeals} deal(s)\n` : ''}` +
        `${hasRevenue ? `• $${customer.totalRevenue.toLocaleString()} in revenue\n` : ''}` +
        `\nDeleting this customer would:\n` +
        `• Break deal records (deals would reference deleted customer)\n` +
        `• Lose revenue data\n` +
        `• Corrupt historical reports\n` +
        `• Affect financial records\n\n` +
        `If you need to correct data, please edit the customer instead.`;
      
      alert(confirmMessage);
      return;
    }

    const confirmMessage = 'Are you sure you want to delete this customer?';
    if (window.confirm(confirmMessage)) {
      try {
        await customersAPI.delete(id);
        fetchCustomers();
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to delete customer';
        alert(errorMessage);
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCustomer(null);
  };

  const handleFormSubmit = () => {
    handleModalClose();
    fetchCustomers();
  };

  if (loading) {
    return <div className="loading">Loading customers...</div>;
  }

  return (
    <div className="customers-container">
      <div className="page-header">
        <h2>Customers ({customers.length})</h2>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="customers-grid">
        {customers.length === 0 ? (
          <div className="empty-state">No customers found</div>
        ) : (
          customers.map((customer) => (
            <div key={customer._id} className="customer-card">
              <div className="customer-header">
                <h3>{customer.name}</h3>
                <span
                  className={`status-badge ${
                    customer.status === 'Active' ? 'active' : 'inactive'
                  }`}
                >
                  {customer.status}
                </span>
              </div>
              <div className="customer-info">
                <p>
                  <strong>Email:</strong> {customer.email}
                </p>
                <p>
                  <strong>Phone:</strong> {customer.phone}
                </p>
                {customer.company && (
                  <p>
                    <strong>Company:</strong> {customer.company}
                  </p>
                )}
                {customer.address && (
                  <p>
                    <strong>Address:</strong> {customer.address}
                  </p>
                )}
                <p>
                  <strong>Total Deals:</strong> {customer.totalDeals || 0}
                </p>
                <p>
                  <strong>Total Revenue:</strong> $
                  {(customer.totalRevenue || 0).toLocaleString()}
                </p>
                {customer.assignedTo && (
                  <p>
                    <strong>Assigned To:</strong>{' '}
                    {customer.assignedTo.name || 'N/A'}
                  </p>
                )}
              </div>
              <div className="customer-actions">
                <button
                  onClick={() => handleEdit(customer)}
                  className="btn-secondary"
                >
                  Edit
                </button>
                {user?.role === 'Admin' && (
                  <button
                    onClick={() => handleDelete(customer._id)}
                    className="btn-danger"
                    disabled={(customer.totalDeals > 0) || (customer.totalRevenue > 0)}
                    title={
                      (customer.totalDeals > 0) || (customer.totalRevenue > 0)
                        ? `Cannot delete customer with ${customer.totalDeals} deal(s) and $${(customer.totalRevenue || 0).toLocaleString()} in revenue. This would affect deal records and revenue data.`
                        : 'Delete customer'
                    }
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
        <Modal
          onClose={handleModalClose}
          title="Edit Customer"
        >
          <CustomerForm
            customer={editingCustomer}
            onSuccess={handleFormSubmit}
            onCancel={handleModalClose}
          />
        </Modal>
      )}
    </div>
  );
};

export default CustomersList;

