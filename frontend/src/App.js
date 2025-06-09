import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CaseList from './pages/CaseList';
import CaseForm from './pages/CaseForm';
import ReportList from './pages/ReportList';
import ReportForm from './pages/ReportForm';
import UploadMedia from './pages/UploadMedia';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header>
          <h1>🕊️ Human Rights Monitor</h1>
          <nav>
            <Link to="/cases">📁 Cases</Link>
            <Link to="/reports">📄 Reports</Link>
            <Link to="/cases/new">➕ Add Case</Link>
            <Link to="/reports/new">➕ Add Report</Link>
            <Link to="/upload">Upload</Link>
            <Link to="/analytics">Analytics</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/cases" element={<CaseList />} />
            <Route path="/cases/new" element={<CaseForm />} />
            <Route path="/reports" element={<ReportList />} />
            <Route path="/reports/new" element={<ReportForm />} />
            <Route path="/upload" element={<UploadMedia />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} /> 
          </Routes>
        </main>
      </div>
    </Router>
  );
}
export default App;
