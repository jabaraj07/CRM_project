import { useState, useEffect } from 'react';
import { dealsAPI, customersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DealForm from './DealForm';
import Modal from '../common/Modal';
import './Deals.css';

const DealsList = () => {
  const [deals, setDeals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'pipeline'
  const { user } = useAuth();

  useEffect(() => {
    fetchDeals();
    fetchCustomers();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await dealsAPI.getAll();
      setDeals(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load deals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customersAPI.getAll();
      setCustomers(response.data.data);
    } catch (err) {
      console.error('Failed to load customers');
    }
  };

  const handleCreate = () => {
    setEditingDeal(null);
    setShowModal(true);
  };

  const handleEdit = (deal) => {
    setEditingDeal(deal);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const deal = deals.find(d => d._id === id);
    
    // Check if deal is closed
    if (deal && (deal.stage === 'Closed Won' || deal.stage === 'Closed Lost')) {
      alert(
        `⚠️ Cannot delete closed deals!\n\n` +
        `This deal is marked as "${deal.stage}". ` +
        `Deleting closed deals would affect:\n` +
        `• Customer revenue records\n` +
        `• Historical sales data\n` +
        `• Financial reports\n\n` +
        `If you need to correct data, please edit the deal instead.`
      );
      return;
    }

    const confirmMessage = deal && deal.stage === 'Closed Won'
      ? `⚠️ WARNING: This deal is "Closed Won" with value $${deal.value.toLocaleString()}!\n\n` +
        `Deleting this deal will:\n` +
        `• Subtract $${deal.value.toLocaleString()} from customer revenue\n` +
        `• Remove it from all reports\n` +
        `• Permanently delete historical data\n\n` +
        `Are you absolutely sure you want to delete this deal?`
      : 'Are you sure you want to delete this deal?';

    if (window.confirm(confirmMessage)) {
      try {
        await dealsAPI.delete(id);
        fetchDeals();
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to delete deal';
        alert(errorMessage);
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingDeal(null);
  };

  const handleFormSubmit = () => {
    handleModalClose();
    fetchDeals();
  };

  const getStageColor = (stage) => {
    const colors = {
      Prospecting: '#3498db',
      Qualification: '#f39c12',
      Proposal: '#9b59b6',
      Negotiation: '#e67e22',
      'Closed Won': '#27ae60',
      'Closed Lost': '#e74c3c',
    };
    return colors[stage] || '#95a5a6';
  };

  const stages = [
    'Prospecting',
    'Qualification',
    'Proposal',
    'Negotiation',
    'Closed Won',
    'Closed Lost',
  ];

  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage] = deals.filter((deal) => deal.stage === stage);
    return acc;
  }, {});

  if (loading) {
    return <div className="loading">Loading deals...</div>;
  }

  return (
    <div className="deals-container">
      <div className="page-header">
        <div className="header-actions">
          <button onClick={handleCreate} className="btn-primary">
            + Add New Deal
          </button>
          <div className="view-toggle">
            <button
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'active' : ''}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('pipeline')}
              className={viewMode === 'pipeline' ? 'active' : ''}
            >
              Pipeline View
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {viewMode === 'list' ? (
        <div className="deals-grid">
          {deals.length === 0 ? (
            <div className="empty-state">No deals found</div>
          ) : (
            deals.map((deal) => (
              <div key={deal._id} className="deal-card">
                <div className="deal-header">
                  <h3>{deal.title}</h3>
                  <span
                    className="stage-badge"
                    style={{ backgroundColor: getStageColor(deal.stage) }}
                  >
                    {deal.stage}
                  </span>
                </div>
                <div className="deal-info">
                  <p>
                    <strong>Value:</strong> ${deal.value.toLocaleString()}
                  </p>
                  <p>
                    <strong>Customer:</strong>{' '}
                    {deal.customer?.name || 'N/A'}
                  </p>
                  <p>
                    <strong>Probability:</strong> {deal.probability || 0}%
                  </p>
                  {deal.expectedCloseDate && (
                    <p>
                      <strong>Expected Close:</strong>{' '}
                      {new Date(deal.expectedCloseDate).toLocaleDateString()}
                    </p>
                  )}
                  {deal.assignedTo && (
                    <p>
                      <strong>Assigned To:</strong>{' '}
                      {deal.assignedTo.name || 'N/A'}
                    </p>
                  )}
                  {deal.notes && (
                    <p>
                      <strong>Notes:</strong> {deal.notes}
                    </p>
                  )}
                </div>
                <div className="deal-actions">
                  <button
                    onClick={() => handleEdit(deal)}
                    className="btn-secondary"
                    disabled={deal.stage === 'Closed Won' || deal.stage === 'Closed Lost'}
                    title={
                      deal.stage === 'Closed Won' || deal.stage === 'Closed Lost'
                        ? 'Closed deals cannot be edited. Only Admins can make corrections.'
                        : 'Edit deal'
                    }
                  >
                    Edit
                  </button>
                  {user?.role === 'Admin' && (
                    <button
                      onClick={() => handleDelete(deal._id)}
                      className="btn-danger"
                      disabled={deal.stage === 'Closed Won' || deal.stage === 'Closed Lost'}
                      title={
                        deal.stage === 'Closed Won' || deal.stage === 'Closed Lost'
                          ? 'Closed deals cannot be deleted. They affect revenue records and historical data.'
                          : 'Delete deal'
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
      ) : (
        <div className="pipeline-view">
          {stages.map((stage) => (
            <div key={stage} className="pipeline-column">
              <div className="pipeline-column-header">
                <h4>{stage}</h4>
                <span className="deal-count">
                  {dealsByStage[stage]?.length || 0}
                </span>
              </div>
              <div className="pipeline-deals">
                {dealsByStage[stage]?.map((deal) => (
                  <div
                    key={deal._id}
                    className={`pipeline-deal-card ${(deal.stage === 'Closed Won' || deal.stage === 'Closed Lost') ? 'closed-deal' : ''}`}
                    onClick={() => {
                      if (deal.stage !== 'Closed Won' && deal.stage !== 'Closed Lost') {
                        handleEdit(deal);
                      }
                    }}
                    style={{
                      cursor: (deal.stage === 'Closed Won' || deal.stage === 'Closed Lost') ? 'not-allowed' : 'pointer',
                      opacity: (deal.stage === 'Closed Won' || deal.stage === 'Closed Lost') ? 0.7 : 1
                    }}
                    title={
                      deal.stage === 'Closed Won' || deal.stage === 'Closed Lost'
                        ? 'Closed deals cannot be edited. Only Admins can make corrections.'
                        : 'Click to edit'
                    }
                  >
                    <h5>{deal.title}</h5>
                    <p className="deal-value">
                      ${deal.value.toLocaleString()}
                    </p>
                    <p className="deal-customer">
                      {deal.customer?.name || 'N/A'}
                    </p>
                    {deal.probability && (
                      <div className="probability-bar">
                        <div
                          className="probability-fill"
                          style={{ width: `${deal.probability}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          onClose={handleModalClose}
          title={editingDeal ? 'Edit Deal' : 'Create Deal'}
        >
          <DealForm
            deal={editingDeal}
            customers={customers}
            onSuccess={handleFormSubmit}
            onCancel={handleModalClose}
          />
        </Modal>
      )}
    </div>
  );
};

export default DealsList;

