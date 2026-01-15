import { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getDashboard();
      setDashboardData(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon leads">📋</div>
          <div className="stat-content">
            <h3>Total Leads</h3>
            <p className="stat-value">{dashboardData?.totalLeads || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon customers">👥</div>
          <div className="stat-content">
            <h3>Total Customers</h3>
            <p className="stat-value">{dashboardData?.totalCustomers || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon deals">💼</div>
          <div className="stat-content">
            <h3>Total Deals</h3>
            <p className="stat-value">{dashboardData?.totalDeals || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon revenue">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">
              ${dashboardData?.totalRevenue?.toLocaleString() || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Leads by Status</h3>
          {dashboardData?.leadsByStatus ? (
            <div className="status-list">
              {Object.entries(dashboardData.leadsByStatus).map(([status, count]) => (
                <div key={status} className="status-item">
                  <span className="status-label">{status}</span>
                  <span className="status-count">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No data available</p>
          )}
        </div>

        <div className="dashboard-card">
          <h3>Deals by Stage</h3>
          {dashboardData?.dealsByStage ? (
            <div className="status-list">
              {Object.entries(dashboardData.dealsByStage).map(([stage, count]) => (
                <div key={stage} className="status-item">
                  <span className="status-label">{stage}</span>
                  <span className="status-count">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

