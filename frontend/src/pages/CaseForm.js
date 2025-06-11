import React, { useState } from 'react';
import { submitCase } from '../services/api';

function CaseForm() {
  const [form, setForm] = useState({
    case_id: '',
    title: '',
    description: '',
    violation_types: '',
    status: 'new',
    priority: 'medium',
     location: {
      country: '',
      region: '',
      city: '',
      coordinates: [0, 0],
    },
    date_occurred: '',
    date_reported: '',
    victims: '',
    perpetrator_name: '',
    perpetrator_type: '',
    evidence_type: 'photo',
    evidence_url: '',
    evidence_description: '',
    created_by: 'admin',
  });

  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
  });
  

    const [isGettingLocation, setIsGettingLocation] = useState(false);
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

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value  });
    const { name, value } = e.target;


    if (name === 'location_country' || name === 'location_region' || name === 'location_city') {
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

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.case_id || !form.title || !form.description || !form.location_country || !form.date_occurred || !form.date_reported) {
      alert('Please fill in all required fields (Case ID, Title, Description, Location Country, Date Occurred, Date Reported)');
      return;
    }

    const payload = {
      case_id: form.case_id,
      title: form.title,
      description: form.description,
      violation_types: form.violation_types ? form.violation_types.split(',').map(t => t.trim()) : [],
      status: form.status,
      priority: form.priority,
      location: {
        country: form.location_country,
        region: form.location_region || null,
        coordinates: {
          latitude: parseFloat(form.location_latitude) || 0,
          longitude: parseFloat(form.location_longitude) || 0
        }
      },
      date_occurred: new Date(form.date_occurred).toISOString(),
      date_reported: new Date(form.date_reported).toISOString(),
      victims: form.victims ? form.victims.split(',').map(v => v.trim()) : [],
      perpetrators: form.perpetrator_name && form.perpetrator_type ? [{
        name: form.perpetrator_name,
        type: form.perpetrator_type,
      }] : [],
      evidence: form.evidence_url ? [{
        type: form.evidence_type,
        url: form.evidence_url,
        description: form.evidence_description || null,
        date_captured: new Date().toISOString(),
      }] : [],
      created_by: form.created_by,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await submitCase(payload);
      alert('Case submitted successfully!');
      setForm({
        case_id: '',
        title: '',
        description: '',
        violation_types: '',
        status: 'new',
        priority: 'medium',
        location_country: '',
        location_region: '',
        location_latitude: '',
        location_longitude: '',
        date_occurred: '',
        date_reported: '',
        victims: '',
        perpetrator_name: '',
        perpetrator_type: '',
        evidence_type: 'photo',
        evidence_url: '',
        evidence_description: '',
        created_by: 'admin',
      });
    } catch (error) {
      console.error('Error submitting case:', error);
      alert('Failed to submit case. See console for details.');
    }
  };

  
  return (
    <div className="page form">
      <h2>Add New Case</h2>
      <form onSubmit={handleSubmit}>
        <label>Case ID *</label>
        <input name="case_id" value={form.case_id} onChange={handleChange} required />

        <label>Title *</label>
        <input name="title" value={form.title} onChange={handleChange} required />

        <label>Description *</label>
        <textarea name="description" value={form.description} onChange={handleChange} required />

        <label>Violation Types (comma separated)</label>
        <input name="violation_types" value={form.violation_types} onChange={handleChange} />

        <label>Status</label>
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="new">New</option>
          <option value="under_investigation">Under Investigation</option>
          <option value="resolved">Resolved</option>
        </select>

        <label>Priority</label>
        <select name="priority" value={form.priority} onChange={handleChange}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

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

        {}
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
        <input
          name="location_city"
          placeholder="City"
          value={form.location.city}
          onChange={handleChange}
        />

        {}
        <input
          type="number"
          step="0.000001"
          placeholder="Longitude"
          value={form.location.coordinates[0]}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
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
            const val = parseFloat(e.target.value);
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


        <label>Date Occurred *</label>
        <input name="date_occurred" type="date" value={form.date_occurred} onChange={handleChange} required />
        <label>Date Reported *</label>
        <input name="date_reported" type="date" value={form.date_reported} onChange={handleChange} required />

        <label>Victims (comma separated)</label>
        <input name="victims" value={form.victims} onChange={handleChange} />

        <h3>Perpetrator</h3>
        <label>Name</label>
        <input name="perpetrator_name" value={form.perpetrator_name} onChange={handleChange} />
        <label>Type</label>
        <input name="perpetrator_type" value={form.perpetrator_type} onChange={handleChange} />

        <h3>Evidence</h3>
        <label>Type</label>
        <select name="evidence_type" value={form.evidence_type} onChange={handleChange}>
          <option value="photo">Photo</option>
          <option value="video">Video</option>
          <option value="document">Document</option>
        </select>
        <label>URL</label>
        <input name="evidence_url" value={form.evidence_url} onChange={handleChange} />
        <label>Description</label>
        <input name="evidence_description" value={form.evidence_description} onChange={handleChange} />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default CaseForm;
