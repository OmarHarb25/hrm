import React, { useEffect, useState } from 'react';
import { fetchCases, submitCase, deleteCaseById, updateCaseById } from '../services/api';

function CaseDashboard() {
  const [cases, setCases] = useState([]);
  const [view, setView] = useState('list');
  const [selectedCase, setSelectedCase] = useState(null);

  const [filters, setFilters] = useState({
    status: '',
    violation: '',
    date: '',
    city: '',
  });

  const [form, setForm] = useState({
    case_id: '',
    title: '',
    description: '',
    violation_types: '',
    status: 'new',
    priority: '',
    location: {
      country: '',
      region: '',
      coordinates: [0, 0],
    },
    date_occurred: '',
    date_reported: '',
    victims: [],
    perpetrators: [],
    evidence: [],    
    created_by: 'admin',
    created_at: '',
    updated_at: '',
  });

  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
  });

  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const res = await fetchCases();
      setCases(res.data);
    } catch (err) {
      console.error('Failed to load cases:', err);
    }
  };

  const resetForm = () => {
    setForm({
      case_id: '',
      title: '',
      description: '',
      violation_types: '',
      status: 'new',
      priority: '',
      location: {
        country: '',
        region: '',
        coordinates: [0, 0], 
      },
      date_occurred: '',
      date_reported: '',
      victims: [],
      perpetrators: [],
      evidence: [],
      created_by: 'admin',
      created_at: '',
      updated_at: '',
    });
    setSelectedCase(null);
    setView('list');
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocation({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: 'Geolocation is not supported by your browser',
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsGettingLocation(false);
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({ latitude, longitude, accuracy, error: null });

        setForm((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: [longitude, latitude],
          },
        }));
      },
      (error) => {
        setIsGettingLocation(false);
        setLocation({
          latitude: null,
          longitude: null,
          accuracy: null,
          error: error.message,
        });
      }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'location_country' || name === 'location_region') {
      const key = name.split('_')[1];
      setForm((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [key]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handlePerpetratorChange = (index, field, value) => {
    const newPerps = [...form.perpetrators];
    newPerps[index][field] = value;
    setForm({ ...form, perpetrators: newPerps });
  };

  const addPerpetrator = () => {
    setForm({ ...form, perpetrators: [...form.perpetrators, { name: '', type: '' }] });
  };

  const removePerpetrator = (index) => {
    const newPerps = form.perpetrators.filter((_, i) => i !== index);
    setForm({ ...form, perpetrators: newPerps });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.case_id || !form.title || !form.description || !form.violation_types) {
      alert('Please fill in all required fields');
      return;
    }

    const payload = {
      ...form,
      violation_types: form.violation_types.split(',').map((v) => v.trim()),
      date_occurred: form.date_occurred ? new Date(form.date_occurred).toISOString() : new Date().toISOString(),
      date_reported: form.date_reported ? new Date(form.date_reported).toISOString() : new Date().toISOString(),
      created_at: form.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      victims: form.victims,
      evidence: form.evidence,
    };

    try {
      if (view === 'edit' && selectedCase) {
        // Use PUT for full case updates
        await updateCaseById(selectedCase.case_id, payload);
        alert('Case updated!');
      } else {
        await submitCase(payload);
        alert('Case submitted!');
      }
      resetForm();
      loadCases();
    } catch (err) {
      console.error('Error submitting case:', err);
      alert('Something went wrong: ' + err.message);
    }
  };

  const handleEdit = (item) => {
    setSelectedCase(item);
    setForm({
      case_id: item.case_id || '',
      title: item.title || '',
      description: item.description || '',
      violation_types: item.violation_types?.join(', ') || '',
      status: item.status || 'new',
      priority: item.priority || '',
      location: {
        country: item.location?.country || '',
        region: item.location?.region || '',
        coordinates: item.location?.coordinates || [0, 0], // Fixed: Consistent array structure
      },
      date_occurred: item.date_occurred ? item.date_occurred.slice(0, 10) : '',
      date_reported: item.date_reported ? item.date_reported.slice(0, 10) : '',
      victims: item.victims || [],
      perpetrators: item.perpetrators || [],
      evidence: item.evidence || [],
      created_by: item.created_by || 'admin',
      created_at: item.created_at || '',
      updated_at: item.updated_at || '',
    });
    setView('edit');
  };

  const handleDelete = async (case_id) => {
    if (!window.confirm('Delete this case?')) return;
    try {
      await deleteCaseById(case_id);
      loadCases();
    } catch (err) {
      console.error(err);
      alert('Failed to delete case.');
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesStatus = !filters.status || c.status === filters.status;
    const matchesViolation = !filters.violation || c.violation_types?.includes(filters.violation);
    const matchesCity = !filters.city || c.location?.country?.toLowerCase().includes(filters.city.toLowerCase());
    const matchesDate = !filters.date || c.date_occurred?.slice(0, 10) === filters.date;
    return matchesStatus && matchesViolation && matchesCity && matchesDate;
  });

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <button onClick={() => setView('list')}>📋 View Cases</button>
        <button
          onClick={() => {
            resetForm();
            setView('add');
          }}
        >
          ➕ Add Case
        </button>
      </aside>

      <div className="main-content">
        {view === 'list' && (
          <>
            <h2>All Cases</h2>
            <div className="filters">
              <input
                placeholder="Country/City"
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

            {filteredCases.map((item) => (
              <div key={item._id} className="card" style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <p>
                  Country: {item.location?.country} | Region: {item.location?.region}
                </p>
                <p>Status: {item.status}</p>
                <p>Date: {item.date_occurred?.slice(0, 10)}</p>
                <p>Violations: {item.violation_types?.join(', ')}</p>
                <button onClick={() => handleEdit(item)}>✏️ Edit</button>{' '}
                <button onClick={() => handleDelete(item.case_id)}>🗑️ Delete</button>
              </div>
            ))}
          </>
        )}

        {(view === 'add' || view === 'edit') && (
          <>
            <h2>{view === 'add' ? 'Add New Case' : 'Edit Case'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '600px' }}>
              <input
                name="case_id"
                placeholder="Case ID *"
                value={form.case_id}
                onChange={handleChange}
                required
              />
              <input 
                name="title" 
                placeholder="Title *" 
                value={form.title} 
                onChange={handleChange} 
                required 
              />
              <textarea
                name="description"
                placeholder="Description *"
                value={form.description}
                onChange={handleChange}
                required
                rows="4"
              />
              <input
                name="violation_types"
                placeholder="Violation Types (comma separated) *"
                value={form.violation_types}
                onChange={handleChange}
                required
              />
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="new">New</option>
                <option value="under_investigation">Under Investigation</option>
                <option value="resolved">Resolved</option>
              </select>
              <input
                name="priority"
                placeholder="Priority"
                value={form.priority}
                onChange={handleChange}
              />

              <div className="location-section">
                <h3>Location Information</h3>
                
                <div className="geolocation-controls">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      padding: '10px 15px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isGettingLocation ? 'not-allowed' : 'pointer',
                      marginBottom: '10px',
                    }}
                  >
                    {isGettingLocation ? 'Getting Location...' : 'Get Current Location'}
                  </button>

                  {location.latitude !== null && location.longitude !== null && (
                    <div
                      style={{
                        backgroundColor: '#d4edda',
                        padding: '10px',
                        borderRadius: '4px',
                        marginBottom: '10px',
                      }}
                    >
                      <strong>Current Location:</strong>
                      <br />
                      Latitude: {location.latitude.toFixed(6)}
                      <br />
                      Longitude: {location.longitude.toFixed(6)}
                      <br />
                      Accuracy: ±{Math.round(location.accuracy)}m
                    </div>
                  )}

                  {location.error && (
                    <div
                      style={{
                        backgroundColor: '#f8d7da',
                        padding: '10px',
                        borderRadius: '4px',
                        marginBottom: '10px',
                      }}
                    >
                      <strong>Location Error:</strong> {location.error}
                    </div>
                  )}
                </div>

                <input
                  name="location_country"
                  placeholder="Country"
                  value={form.location.country}
                  onChange={handleChange}
                />
                <input
                  name="location_region"
                  placeholder="Region"
                  value={form.location.region}
                  onChange={handleChange}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Longitude"
                    value={form.location.coordinates[0]}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setForm((prev) => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          coordinates: [val, prev.location.coordinates[1]],
                        },
                      }));
                    }}
                  />
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Latitude"
                    value={form.location.coordinates[1]}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setForm((prev) => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          coordinates: [prev.location.coordinates[0], val],
                        },
                      }));
                    }}
                  />
                </div>
              </div>

              <div>
                <label>Date Occurred:</label>
                <input
                  type="date"
                  name="date_occurred"
                  value={form.date_occurred}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label>Date Reported:</label>
                <input
                  type="date"
                  name="date_reported"
                  value={form.date_reported}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Perpetrators:</label>
                {form.perpetrators.map((p, idx) => (
                  <div key={idx} style={{ marginBottom: '4px', display: 'flex', gap: '5px' }}>
                    <input
                      placeholder="Name"
                      value={p.name}
                      onChange={(e) => handlePerpetratorChange(idx, 'name', e.target.value)}
                    />
                    <input
                      placeholder="Type"
                      value={p.type}
                      onChange={(e) => handlePerpetratorChange(idx, 'type', e.target.value)}
                    />
                    <button type="button" onClick={() => removePerpetrator(idx)}>
                      Remove
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addPerpetrator}>
                  Add Perpetrator
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px' }}>
                  {view === 'add' ? 'Submit' : 'Update'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setView('list');
                  }}
                  style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default CaseDashboard;