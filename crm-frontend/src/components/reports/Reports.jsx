import { useState, useEffect } from 'react';
import { reportsAPI } from '../../services/api';
import './Reports.css';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('leads');
  const [leadReports, setLeadReports] = useState(null);
  const [dealReports, setDealReports] = useState(null);
  const [revenueReports, setRevenueReports] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports(activeTab);
  }, [activeTab]);

  const fetchReports = async (tab) => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'leads') {
        const response = await reportsAPI.getLeadReports();
        setLeadReports(response.data.data);
      } else if (tab === 'deals') {
        const response = await reportsAPI.getDealReports();
        setDealReports(response.data.data);
      } else if (tab === 'revenue') {
        const response = await reportsAPI.getRevenueReports();
        setRevenueReports(response.data.data);
      }
    } catch (err) {
      setError('Failed to load reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderLeadReports = () => {
    if (!leadReports) return <div className="loading">Loading...</div>;

    return (
      <div className="reports-content">
        <div className="report-card">
          <h3>Lead Statistics</h3>
          <div className="stat-row">
            <div className="stat-item">
              <span className="stat-label">Total Leads</span>
              <span className="stat-value">{leadReports.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Conversion Rate</span>
              <span className="stat-value">{leadReports.conversionRate}%</span>
            </div>
          </div>
        </div>

        <div className="report-card">
          <h3>Leads by Status</h3>
          <div className="chart-container">
            {Object.entries(leadReports.byStatus).map(([status, count]) => (
              <div key={status} className="chart-item">
                <div className="chart-label">{status}</div>
                <div className="chart-bar">
                  <div
                    className="chart-fill"
                    style={{
                      width: `${(count / leadReports.total) * 100}%`,
                    }}
                  />
                </div>
                <div className="chart-value">{count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-card">
          <h3>Leads by Source</h3>
          <div className="chart-container">
            {Object.entries(leadReports.bySource).map(([source, count]) => (
              <div key={source} className="chart-item">
                <div className="chart-label">{source}</div>
                <div className="chart-bar">
                  <div
                    className="chart-fill"
                    style={{
                      width: `${(count / leadReports.total) * 100}%`,
                    }}
                  />
                </div>
                <div className="chart-value">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDealReports = () => {
    if (!dealReports) return <div className="loading">Loading...</div>;

    return (
      <div className="reports-content">
        <div className="report-card">
          <h3>Deal Statistics</h3>
          <div className="stat-grid">
            <div className="stat-item">
              <span className="stat-label">Total Deals</span>
              <span className="stat-value">{dealReports.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Value</span>
              <span className="stat-value">
                ${dealReports.totalValue.toLocaleString()}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Won Deals</span>
              <span className="stat-value">{dealReports.wonDeals}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Won Value</span>
              <span className="stat-value">
                ${dealReports.wonValue.toLocaleString()}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Win Rate</span>
              <span className="stat-value">{dealReports.winRate}%</span>
            </div>
          </div>
        </div>

        <div className="report-card">
          <h3>Deals by Stage</h3>
          <div className="chart-container">
            {Object.entries(dealReports.byStage).map(([stage, count]) => (
              <div key={stage} className="chart-item">
                <div className="chart-label">{stage}</div>
                <div className="chart-bar">
                  <div
                    className="chart-fill"
                    style={{
                      width: `${
                        dealReports.total > 0
                          ? (count / dealReports.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <div className="chart-value">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderRevenueReports = () => {
    if (!revenueReports) return <div className="loading">Loading...</div>;

    return (
      <div className="reports-content">
        <div className="report-card">
          <h3>Revenue Statistics</h3>
          <div className="stat-grid">
            <div className="stat-item">
              <span className="stat-label">Total Revenue</span>
              <span className="stat-value revenue">
                ${revenueReports.totalRevenue.toLocaleString()}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Deals</span>
              <span className="stat-value">{revenueReports.totalDeals}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Average Deal Size</span>
              <span className="stat-value">
                ${parseFloat(revenueReports.averageDealSize).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="report-card">
          <h3>Revenue by Month</h3>
          <div className="chart-container">
            {Object.entries(revenueReports.byMonth).map(([month, revenue]) => (
              <div key={month} className="chart-item">
                <div className="chart-label">{month}</div>
                <div className="chart-bar">
                  <div
                    className="chart-fill revenue-fill"
                    style={{
                      width: `${
                        revenueReports.totalRevenue > 0
                          ? (revenue / revenueReports.totalRevenue) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <div className="chart-value">
                  ${revenue.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {revenueReports.topDeals && revenueReports.topDeals.length > 0 && (
          <div className="report-card">
            <h3>Top Deals</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Deal</th>
                    <th>Customer</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueReports.topDeals.map((deal) => (
                    <tr key={deal._id}>
                      <td>{deal.title}</td>
                      <td>{deal.customer?.name || 'N/A'}</td>
                      <td>${deal.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="reports-container">
      <div className="reports-tabs">
        <button
          className={activeTab === 'leads' ? 'active' : ''}
          onClick={() => setActiveTab('leads')}
        >
          Lead Reports
        </button>
        <button
          className={activeTab === 'deals' ? 'active' : ''}
          onClick={() => setActiveTab('deals')}
        >
          Deal Reports
        </button>
        <button
          className={activeTab === 'revenue' ? 'active' : ''}
          onClick={() => setActiveTab('revenue')}
        >
          Revenue Reports
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="loading">Loading reports...</div>
      ) : (
        <>
          {activeTab === 'leads' && renderLeadReports()}
          {activeTab === 'deals' && renderDealReports()}
          {activeTab === 'revenue' && renderRevenueReports()}
        </>
      )}
    </div>
  );
};

export default Reports;

