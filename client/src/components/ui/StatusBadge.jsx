import React from 'react';

const StatusBadge = ({ status }) => {
  const statusColors = {
    Draft: 'status-draft',
    Pending: 'status-pending',
    Paid: 'status-paid',
    Overdue: 'status-overdue',
  };
  return <span className={`status-badge ${statusColors[status] || ''}`}>{status}</span>;
};

export default StatusBadge;
