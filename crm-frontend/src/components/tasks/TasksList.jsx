import { useState, useEffect } from 'react';
import { tasksAPI, leadsAPI, customersAPI, dealsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import TaskForm from './TaskForm';
import Modal from '../common/Modal';
import './Tasks.css';

const TasksList = () => {
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const { user } = useAuth();

  useEffect(() => {
    fetchTasks();
    fetchRelatedData();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getAll();
      setTasks(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedData = async () => {
    try {
      const [leadsRes, customersRes, dealsRes] = await Promise.all([
        leadsAPI.getAll(),
        customersAPI.getAll(),
        dealsAPI.getAll(),
      ]);
      setLeads(leadsRes.data.data);
      setCustomers(customersRes.data.data);
      setDeals(dealsRes.data.data);
    } catch (err) {
      console.error('Failed to load related data');
    }
  };

  const handleCreate = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksAPI.delete(id);
        fetchTasks();
      } catch (err) {
        alert('Failed to delete task');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const handleFormSubmit = () => {
    handleModalClose();
    fetchTasks();
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: '#f39c12',
      'In Progress': '#3498db',
      Completed: '#27ae60',
      Cancelled: '#e74c3c',
    };
    return colors[status] || '#95a5a6';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: '#95a5a6',
      Medium: '#f39c12',
      High: '#e74c3c',
    };
    return colors[priority] || '#95a5a6';
  };

  const getRelatedName = (task) => {
    if (task.relatedTo === 'Lead') {
      const lead = leads.find((l) => l._id === task.relatedId);
      return lead?.name || 'Unknown Lead';
    } else if (task.relatedTo === 'Customer') {
      const customer = customers.find((c) => c._id === task.relatedId);
      return customer?.name || 'Unknown Customer';
    } else if (task.relatedTo === 'Deal') {
      const deal = deals.find((d) => d._id === task.relatedId);
      return deal?.title || 'Unknown Deal';
    }
    return 'N/A';
  };

  const filteredTasks =
    filterStatus === 'All'
      ? tasks
      : tasks.filter((task) => task.status === filterStatus);

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  return (
    <div className="tasks-container">
      <div className="page-header">
        <div className="header-actions">
          <button onClick={handleCreate} className="btn-primary">
            + Add New Task
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
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="tasks-grid">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">No tasks found</div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task._id} className="task-card">
              <div className="task-header">
                <h3>{task.title}</h3>
                <div className="task-badges">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(task.status) }}
                  >
                    {task.status}
                  </span>
                  <span
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
              <div className="task-info">
                <p>
                  <strong>Type:</strong> {task.type}
                </p>
                <p>
                  <strong>Related To:</strong> {task.relatedTo} -{' '}
                  {getRelatedName(task)}
                </p>
                <p>
                  <strong>Due Date:</strong>{' '}
                  {new Date(task.dueDate).toLocaleDateString()}
                </p>
                {task.description && (
                  <p>
                    <strong>Description:</strong> {task.description}
                  </p>
                )}
                {task.assignedTo && (
                  <p>
                    <strong>Assigned To:</strong>{' '}
                    {task.assignedTo.name || 'N/A'}
                  </p>
                )}
              </div>
              <div className="task-actions">
                <button
                  onClick={() => handleEdit(task)}
                  className="btn-secondary"
                >
                  Edit
                </button>
                {user?.role === 'Admin' && (
                  <button
                    onClick={() => handleDelete(task._id)}
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
        <Modal
          onClose={handleModalClose}
          title={editingTask ? 'Edit Task' : 'Create Task'}
        >
          <TaskForm
            task={editingTask}
            leads={leads}
            customers={customers}
            deals={deals}
            onSuccess={handleFormSubmit}
            onCancel={handleModalClose}
          />
        </Modal>
      )}
    </div>
  );
};

export default TasksList;

