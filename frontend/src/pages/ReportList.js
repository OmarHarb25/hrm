import React, { useEffect, useState } from 'react';
import { fetchReports } from '../services/api';

function ReportList() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports().then(res => setReports(res.data));
  }, []);

  return (
    <div className="page">
      <h2>Incident Reports</h2>
      <ul>
        {reports.map(item => (
          <li key={item.report_id}>
            <h3>{item.incident_details.description}</h3>
            <p>Status: {item.status}</p>
            <p>Location: {item.incident_details.location.city}, {item.incident_details.location.country}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReportList;
