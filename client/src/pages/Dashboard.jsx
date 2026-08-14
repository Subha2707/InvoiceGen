import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Loader from '../components/ui/Loader';
import StatusBadge from '../components/ui/StatusBadge';
import Table from '../components/ui/Table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FiFileText, FiCheckCircle, FiClock, FiAlertCircle, FiPlus, FiSettings } from 'react-icons/fi';
import { formatCurrency, formatDate } from '../utils/invoiceCalc';
import { getErrorMessage } from '../utils/constants';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, profileRes] = await Promise.allSettled([
          api.get('/dashboard/stats'),
          api.get('/business')
        ]);

        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data.data);
        } else {
          setError(getErrorMessage(statsRes.reason, 'Failed to load dashboard stats'));
        }

        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value.data.data || null);
        }
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load dashboard'));
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <Loader label="Loading dashboard stats..." />;

  const chartData = (stats?.monthlyData || []).map(item => ({
    name: monthNames[(item._id.month - 1)] || '',
    Revenue: item.revenue
  }));

  const needsProfile = !profile || !profile.businessName;

  return (
    <div className="page-container">
      {error && <div className="alert alert-error">{error}</div>}

      <div className="dashboard-header">
        <h2>Welcome back, {user?.name}!</h2>
        <p>Here is your invoicing overview.</p>
      </div>

      {needsProfile && (
        <div className="alert alert-warning dashboard-cta">
          <div>
            <strong>Set up your business profile</strong>
            <p>Add your business details once — they appear automatically on every invoice.</p>
          </div>
          <Link to="/business-profile" className="btn btn-primary"><FiSettings /> Setup Profile</Link>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><FiFileText /></div>
          <h3>Total Invoices</h3>
          <p className="stat-number">{stats?.totalInvoices || 0}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon emerald"><FiCheckCircle /></div>
          <h3>Paid</h3>
          <p className="stat-number text-emerald">{stats?.paidInvoices || 0}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><FiClock /></div>
          <h3>Pending</h3>
          <p className="stat-number text-amber">{stats?.pendingInvoices || 0}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon rose"><FiAlertCircle /></div>
          <h3>Overdue</h3>
          <p className="stat-number text-rose">{stats?.overdueInvoices || 0}</p>
        </div>
      </div>

      <div className="stats-grid revenue-grid">
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-number">{formatCurrency(stats?.totalRevenue, 'INR')}</p>
        </div>
        <div className="stat-card">
          <h3>Paid Revenue</h3>
          <p className="stat-number text-emerald">{formatCurrency(stats?.paidRevenue, 'INR')}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Revenue</h3>
          <p className="stat-number text-amber">{formatCurrency(stats?.pendingRevenue, 'INR')}</p>
        </div>
        <div className="stat-card stat-cta">
          <h3>Create Invoice</h3>
          <Link to="/invoices/create" className="btn btn-primary"><FiPlus /> New Invoice</Link>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="chart-section glassmorphism">
          <h3>Revenue (Last 6 Months)</h3>
          {chartData.length === 0 ? (
            <p className="empty-state">No invoice data yet. Create your first invoice to see trends.</p>
          ) : (
            <div className="chart-container" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Revenue" fill="#4361ee" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="recent-invoices glassmorphism">
          <div className="section-heading">
            <h3>Recent Invoices</h3>
            <Link to="/invoices" className="link-primary">View all</Link>
          </div>
          <Table
            columns={['Invoice No', 'Client', 'Date', 'Amount', 'Status', '']}
            data={stats?.recentInvoices || []}
            renderRow={(inv) => (
              <tr key={inv._id}>
                <td>
                  <Link to={`/invoices/view/${inv._id}`} className="link-primary">{inv.invoiceNumber}</Link>
                </td>
                <td>{inv.clientSnapshot?.clientName || inv.client?.clientName || '-'}</td>
                <td>{formatDate(inv.issueDate)}</td>
                <td>{formatCurrency(inv.grandTotal, inv.currency)}</td>
                <td><StatusBadge status={inv.status} /></td>
                <td><Link className="btn btn-sm" to={`/invoices/view/${inv._id}`}>View</Link></td>
              </tr>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;