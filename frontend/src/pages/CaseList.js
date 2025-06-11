import React, { useEffect, useState } from 'react';
import { fetchCases } from '../services/api';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

function CaseList() {
  const [cases, setCases] = useState([]);

  useEffect(() => {
    fetchCases().then(res => setCases(res.data));
  }, []);

  return (
    <div className="page">
      <h2>Cases</h2>
      <ul>
        {cases.map(item => (
          <li key={item.case_id} style={{ marginBottom: '20px', borderBottom: '1px solid #ccc' }}>
            <h3>{item.title} (ID: {item.case_id})</h3>
            <p><strong>Status:</strong> {item.status}</p>
            <p><strong>Priority:</strong> {item.priority || 'N/A'}</p>
            <p><strong>Description:</strong> {item.description}</p>
            <p><strong>Violation Types:</strong> {item.violation_types?.join(', ')}</p>
            <p><strong>Location:</strong> {item.location?.country}, {item.location?.region || 'N/A'}</p>
            <p><strong>Date Occurred:</strong> {formatDate(item.date_occurred)}</p>
            <p><strong>Date Reported:</strong> {formatDate(item.date_reported)}</p>

            <p><strong>Victims:</strong> {item.victims?.length ? item.victims.join(', ') : 'None'}</p>

            <p><strong>Perpetrators:</strong></p>
            <ul>
              {item.perpetrators?.length ? item.perpetrators.map((p, i) => (
                <li key={i}>{p.name} ({p.type})</li>
              )) : <li>None</li>}
            </ul>

            <p><strong>Evidence:</strong></p>
            <ul>
              {item.evidence?.length ? item.evidence.map((e, i) => (
                <li key={i}>
                  Type: {e.type}, 
                  URL: <a href={e.url} target="_blank" rel="noreferrer">{e.url}</a>
                  {e.description ? ` - ${e.description}` : ''}
                </li>
              )) : <li>None</li>}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CaseList;
