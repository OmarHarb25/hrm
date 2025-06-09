import React, { useState } from 'react';
import { submitCase } from '../services/api';

function CaseForm() {
  const [form, setForm] = useState({
    case_id: '',
    title: '',
    description: '',
    violation_types: '',
    status: 'new',
    created_by: 'admin',
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.case_id || !form.title || !form.description) {
      alert('Please fill in all required fields (Case ID, Title, Description)');
      return;
    }

    const payload = {
      case_id: form.case_id,
      title: form.title,
      description: form.description,
      violation_types: form.violation_types ? form.violation_types.split(',').map(t => t.trim()) : [],
      status: form.status,
      priority: 'medium',
      location: { 
        country: 'Unknown',
        region: 'Unknown',
        city: 'Unknown',
        address: 'Unknown',
        coordinates: { 
          type: 'Point', 
          coordinates: [0, 0] 
        } 
      },
      date_occurred: new Date().toISOString(),
      date_reported: new Date().toISOString(),
      victims: [],
      perpetrators: [],
      evidence: [],
      documents: [],
      witnesses: [],
      created_by: form.created_by,
      assigned_to: null,
      tags: [],
      severity: 'medium',
      verified: false,
      public: false,
      source: 'manual_entry',
      follow_up_required: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await submitCase(payload);
      alert('Case submitted successfully!');
      // Reset form
      setForm({
        case_id: '',
        title: '',
        description: '',
        violation_types: '',
        status: 'new',
        created_by: 'admin',
      });
    } catch (error) {
      console.error('Error submitting case:', error);
      if (error.response && error.response.data) {
        console.log('Error details:', error.response.data);
        alert(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
        alert('Failed to submit case. Please check the console for details.');
      }
    }
  };

  return (
    <div className="page form">
      <h2>Add New Case</h2>
      <form onSubmit={handleSubmit}>
        <label>Case ID *</label>
        <input 
          name="case_id" 
          value={form.case_id}
          onChange={handleChange} 
          required 
        />

        <label>Title *</label>
        <input 
          name="title" 
          value={form.title}
          onChange={handleChange} 
          required 
        />

        <label>Description *</label>
        <textarea 
          name="description" 
          value={form.description}
          onChange={handleChange} 
          required 
        />

        <label>Violation Types (comma separated)</label>
        <input 
          name="violation_types" 
          value={form.violation_types}
          onChange={handleChange} 
        />

        <label>Status</label>
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="new">New</option>
          <option value="under_investigation">Under Investigation</option>
          <option value="resolved">Resolved</option>
        </select>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default CaseForm;