import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CaseList from './pages/CaseList';
import CaseForm from './pages/CaseForm';
import ReportList from './pages/ReportList';
import ReportForm from './pages/ReportForm';
import UploadMedia from './pages/UploadMedia';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import CaseDashboard from './pages/CaseDashboard';
import ReportDashboard from './pages/ReportDashboard';
import ReportEdit from './pages/ReportEdit';



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
            <Link to="/reports/new">➕ Add Report</Link>
            <Link to="/analytics">Analytics</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/cases/new" element={<CaseForm />} />
            <Route path="/reports/new" element={<ReportForm />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} /> 
            <Route path="/cases" element={<CaseDashboard />} />
            <Route path="/reports" element={<ReportDashboard />} />
            <Route path="/reports/edit/:reportId" element={<ReportEdit />} />

          </Routes>
        </main>
      </div>
    </Router>
  );
}
export default App;
