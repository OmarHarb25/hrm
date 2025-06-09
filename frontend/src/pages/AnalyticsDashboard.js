import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AnalyticsDashboard() {
  const [violations, setViolations] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [geo, setGeo] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/analytics/violations').then(res => setViolations(res.data));
    axios.get('http://localhost:8000/analytics/timeline').then(res => setTimeline(res.data));
    axios.get('http://localhost:8000/analytics/geodata').then(res => setGeo(res.data));
  }, []);

  return (
    <div className="page">
      <h2>Analytics Dashboard</h2>

      <h3>Violations Count</h3>
      <ul>{violations.map(v => <li key={v._id}>{v._id}: {v.count}</li>)}</ul>

      <h3>Monthly Reports</h3>
      <ul>{timeline.map(t => <li key={t._id}>{t._id}: {t.count}</li>)}</ul>

      <h3>Geo Summary</h3>
      <ul>{geo.map(g => <li key={g._id}>{g._id} → {g.count}</li>)}</ul>
    </div>
  );
}

export default AnalyticsDashboard;