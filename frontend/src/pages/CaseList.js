import React, { useEffect, useState } from 'react';
import { fetchCases } from '../services/api';

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
          <li key={item.case_id}>
            <h3>{item.title}</h3>
            <p>Status: {item.status}</p>
            <p>{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CaseList;

