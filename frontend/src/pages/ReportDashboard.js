import React, { useEffect, useState } from 'react';
import ReportList from './ReportList';
import ReportForm from './ReportForm';

function ReportDashboard() {
  const [view, setView] = useState('list');

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <button onClick={() => setView('list')}>📋 View Reports</button>
        <button onClick={() => setView('add')}>➕ Add Report</button>
      </aside>

      <div className="main-content">
        {view === 'list' && <ReportList />}
        {view === 'add' && <ReportForm />}
      </div>
    </div>
  );
}

export default ReportDashboard;
