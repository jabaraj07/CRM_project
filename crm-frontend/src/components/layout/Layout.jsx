import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>CRM System</h2>
          <button className="sidebar-close" onClick={closeSidebar} aria-label="Close menu">
            ×
          </button>
        </div>
        <ul className="nav-menu">
          <li>
            <Link
              to="/dashboard"
              className={isActive('/dashboard') ? 'active' : ''}
              onClick={closeSidebar}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/leads"
              className={isActive('/leads') ? 'active' : ''}
              onClick={closeSidebar}
            >
              Leads
            </Link>
          </li>
          <li>
            <Link
              to="/customers"
              className={isActive('/customers') ? 'active' : ''}
              onClick={closeSidebar}
            >
              Customers
            </Link>
          </li>
          <li>
            <Link
              to="/deals"
              className={isActive('/deals') ? 'active' : ''}
              onClick={closeSidebar}
            >
              Deals
            </Link>
          </li>
          <li>
            <Link
              to="/tasks"
              className={isActive('/tasks') ? 'active' : ''}
              onClick={closeSidebar}
            >
              Tasks
            </Link>
          </li>
          <li>
            <Link
              to="/reports"
              className={isActive('/reports') ? 'active' : ''}
              onClick={closeSidebar}
            >
              Reports
            </Link>
          </li>
          {user?.role === 'Admin' && (
            <li>
              <Link
                to="/admin"
                className={isActive('/admin') ? 'active' : ''}
                onClick={closeSidebar}
              >
                Admin Panel
              </Link>
            </li>
          )}
        </ul>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>
      <main className="main-content">
        <header className="top-header">
          <button className="menu-toggle" onClick={toggleSidebar} aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <h1>{getPageTitle(location.pathname)}</h1>
        </header>
        <div className="content-wrapper">{children}</div>
      </main>
    </div>
  );
};

const getPageTitle = (pathname) => {
  const titles = {
    '/dashboard': 'Dashboard',
    '/leads': 'Lead Management',
    '/customers': 'Customer Management',
    '/deals': 'Sales Pipeline',
    '/tasks': 'Tasks & Follow-ups',
    '/reports': 'Reports',
    '/admin': 'Admin Panel',
  };
  return titles[pathname] || 'CRM System';
};

export default Layout;

