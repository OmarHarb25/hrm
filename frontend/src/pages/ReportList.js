import React, { useEffect, useState } from 'react';
import { fetchReports } from '../services/api';
import { useNavigate } from 'react-router-dom';

function ReportList() {
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports().then(res => setReports(res.data));
  }, []);

  const handleEdit = (reportId) => {
    navigate(`/reports/edit/${reportId}`);
  };

  return (
    <div className="page">
      <h2>📄 Incident Reports</h2>
      {reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <ul className="report-list">
          {reports.map(item => (
            <li key={item.report_id} className="report-card">
              <h3>📝 {item.title || item.report_id}</h3>
              <p><strong>Status:</strong> {item.status}</p>
              <p><strong>Reporter:</strong> {item.anonymous ? "Anonymous" : item.reporter_info?.name || "N/A"}</p>
              <p><strong>Contact:</strong> {item.reporter_info?.contact || "N/A"}</p>
              <p><strong>Description:</strong> {item.incident_details.description}</p>
              <p><strong>Violations:</strong> {item.incident_details.violation_types.join(', ')}</p>
              <p><strong>Date:</strong> {new Date(item.incident_details.date_occurred || item.incident_details.date).toLocaleString()}</p>
              <p><strong>Location:</strong> {item.incident_details.location.city}, {item.incident_details.location.country}</p>
              <p><strong>Coordinates:</strong> {item.incident_details.location.coordinates?.coordinates?.join(', ')}</p>
              {item.evidence && item.evidence.length > 0 && (
                <div>
                  <strong>Evidence Files:</strong>
                  <ul>
                    {item.evidence.map((ev, i) => (
                      <li key={i}>
                        📎 <a href={ev.url} target="_blank" rel="noreferrer">{ev.description || ev.url}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p><strong>Created At:</strong> {new Date(item.created_at).toLocaleString()}</p>
              <button onClick={() => handleEdit(item.report_id)}>✏️ Edit Report</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ReportList;
