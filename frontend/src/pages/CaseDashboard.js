import CaseForm from '../pages/CaseForm';
import CaseList from '../pages/CaseList';
import React, { useEffect, useState } from 'react';
import { fetchCases, submitCase, deleteCaseById, updateCaseById } from '../services/api';

function CaseDashboard() {
  const [cases, setCases] = useState([]);
  const [view, setView] = useState('list'); 
  const [selectedCase, setSelectedCase] = useState(null);
  const [form, setForm] = useState({
    case_id: '',
    title: '',
    description: '',
    violation_types: '',
    status: 'new',
    created_by: 'admin',
    date_occurred: '',
    location_city: '',
  });

  const [filters, setFilters] = useState({
    status: '',
    violation: '',
    date: '',
    city: '',
  });

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    const res = await fetchCases();
    setCases(res.data);
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFilterChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      ...form,
      violation_types: form.violation_types.split(',').map(v => v.trim()),
      location: {
        city: form.location_city || 'Unknown',
        region: 'Unknown',
        country: 'Unknown',
        address: 'Unknown',
        coordinates: { type: 'Point', coordinates: [0, 0] },
      },
      date_occurred: form.date_occurred || new Date().toISOString(),
      date_reported: new Date().toISOString(),
      victims: [],
      perpetrators: [],
      evidence: [],
      documents: [],
      witnesses: [],
      priority: 'medium',
      severity: 'medium',
      verified: false,
      public: false,
      source: 'manual_entry',
      follow_up_required: false,
      assigned_to: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      if (view === 'edit' && selectedCase) {
        await updateCaseById(selectedCase._id, payload);
        alert('Case updated!');
      } else {
        await submitCase(payload);
        alert('Case submitted!');
      }
      resetForm();
      loadCases();
    } catch (err) {
      console.error(err);
      alert('Something went wrong!');
    }
  };

  const handleEdit = item => {
    setSelectedCase(item);
    setForm({
      ...item,
      violation_types: item.violation_types.join(', '),
      location_city: item.location?.city || '',
      date_occurred: item.date_occurred?.slice(0, 10),
    });
    setView('edit');
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this case?')) return;
    await deleteCaseById(id);
    loadCases();
  };

  const resetForm = () => {
    setForm({
      case_id: '',
      title: '',
      description: '',
      violation_types: '',
      status: 'new',
      created_by: 'admin',
      date_occurred: '',
      location_city: '',
    });
    setSelectedCase(null);
    setView('list');
  };

  const filteredCases = cases.filter(c => {
    const matchesStatus = !filters.status || c.status === filters.status;
    const matchesViolation =
      !filters.violation || c.violation_types.includes(filters.violation);
    const matchesCity =
      !filters.city || c.location?.city?.toLowerCase().includes(filters.city.toLowerCase());
    const matchesDate =
      !filters.date || c.date_occurred?.slice(0, 10) === filters.date;
    return matchesStatus && matchesViolation && matchesCity && matchesDate;
  });

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <button onClick={() => setView('list')}>📋 View Cases</button>
        <button onClick={() => { resetForm(); setView('add'); }}>➕ Add Case</button>
      </aside>

      <div className="main-content">
        {view === 'list' && (
          <>
            <h2>All Cases</h2>
            <div className="filters">
              <input
                placeholder="City"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
              />
              <input
                placeholder="Violation Type"
                name="violation"
                value={filters.violation}
                onChange={handleFilterChange}
              />
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
              />
              <select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">All</option>
                <option value="new">New</option>
                <option value="under_investigation">Under Investigation</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {filteredCases.map(item => (
              <div key={item._id} className="card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <p>City: {item.location?.city}</p>
                <p>Status: {item.status}</p>
                <p>Date: {item.date_occurred?.slice(0, 10)}</p>
                <button onClick={() => handleEdit(item)}>✏️ Edit</button>
                <button onClick={() => handleDelete(item._id)}>🗑️ Delete</button>
              </div>
            ))}
          </>
        )}

        {(view === 'add' || view === 'edit') && (
          <>
            <h2>{view === 'add' ? 'Add New Case' : 'Edit Case'}</h2>
            <form onSubmit={handleSubmit}>
              <input name="case_id" placeholder="Case ID" value={form.case_id} onChange={handleChange} required />
              <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
              <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
              <input name="violation_types" placeholder="Violations (comma separated)" value={form.violation_types} onChange={handleChange} />
              <input type="date" name="date_occurred" value={form.date_occurred} onChange={handleChange} />
              <input name="location_city" placeholder="City" value={form.location_city} onChange={handleChange} />
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="new">New</option>
                <option value="under_investigation">Under Investigation</option>
                <option value="resolved">Resolved</option>
              </select>
              <button type="submit">{view === 'edit' ? 'Update' : 'Submit'}</button>
              <button type="button" onClick={resetForm}>Cancel</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default CaseDashboard;
