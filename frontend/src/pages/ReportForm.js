import React, { useState } from 'react';
import { submitReport } from '../services/api';

function ReportForm() {
  const [form, setForm] = useState({
    report_id: '',
    title: '',
    description: '',
    violation_types: '',
    status: 'new',
    country: '',
    region: '',
    reporter_name: '',
    reporter_contact: '',
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.report_id || !form.title || !form.description) {
      alert('Please fill in all required fields (Report ID, Title, Description)');
      return;
    }

    const payload = {
      report_id: form.report_id,
      title: form.title,
      description: form.description,
      status: form.status,
      priority: 'medium',
      reporter_type: 'individual', // Required field
      anonymous: !form.reporter_name, // Required field
      contact_info: { // Required field
        email: form.reporter_contact || '',
        phone: '',
        address: '',
        preferred_contact: 'email' // Add the missing required field
      },
      incident_details: {
        description: form.description, // Required field - reuse main description
        date: new Date().toISOString(), // Required field
        violation_types: form.violation_types ? form.violation_types.split(',').map(t => t.trim()) : [],
        date_occurred: new Date().toISOString(),
        date_reported: new Date().toISOString(),
        location: {
          country: form.country || 'Unknown',
          region: form.region || 'Unknown',
          city: 'Unknown',
          address: 'Unknown',
          coordinates: {
            type: 'Point',
            coordinates: [0, 0]
          }
        },
        victims: [],
        perpetrators: [],
        witnesses: [],
        evidence: [],
        severity: 'medium',
        verified: false
      },
      reporter_info: {
        name: form.reporter_name || 'Anonymous',
        contact: form.reporter_contact || '',
        email: form.reporter_contact || '',
        phone: '',
        anonymous: !form.reporter_name,
        relationship_to_incident: 'witness'
      },
      evidence: [],
      documents: [],
      media: [],
      tags: [],
      source: 'manual_entry',
      verified: false,
      public: false,
      follow_up_required: false,
      assigned_to: null,
      created_by: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await submitReport(payload);
      alert('Report submitted successfully!');
      // Reset form
      setForm({
        report_id: '',
        title: '',
        description: '',
        violation_types: '',
        status: 'new',
        country: '',
        region: '',
        reporter_name: '',
        reporter_contact: '',
      });
    } catch (error) {
      console.error('=== FULL ERROR DETAILS ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      console.error('=========================');
      
      // Show error in alert for easy copying
      let errorMessage = 'Unknown error occurred';
      if (error.response && error.response.data) {
        errorMessage = JSON.stringify(error.response.data, null, 2);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Create a new window/tab with the error details
      const errorWindow = window.open('', '_blank');
      errorWindow.document.write(`
        <html>
          <head><title>Error Details</title></head>
          <body>
            <h2>Error Details - Copy this:</h2>
            <pre style="background: #f5f5f5; padding: 20px; border: 1px solid #ddd; white-space: pre-wrap;">
Status Code: ${error.response?.status || 'Unknown'}
Error Message: ${error.message || 'Unknown'}

Full Error Response:
${JSON.stringify(error.response?.data, null, 2)}

Full Error Object:
${JSON.stringify(error, null, 2)}
            </pre>
            <button onclick="navigator.clipboard.writeText(document.querySelector('pre').textContent)">Copy to Clipboard</button>
          </body>
        </html>
      `);
      
      alert(`Error occurred! Check console and the new tab for full details. Status: ${error.response?.status || 'Unknown'}`);
    }
  };

  return (
    <div className="page form">
      <h2>Submit Incident Report</h2>
      <form onSubmit={handleSubmit}>
        <label>Report ID *</label>
        <input 
          name="report_id" 
          value={form.report_id}
          onChange={handleChange} 
          placeholder="e.g., RPT-2024-001"
          required 
        />

        <label>Title *</label>
        <input 
          name="title" 
          value={form.title}
          onChange={handleChange} 
          placeholder="Brief title of the incident"
          required 
        />

        <label>Description *</label>
        <textarea 
          name="description" 
          value={form.description}
          onChange={handleChange} 
          placeholder="Detailed description of what happened"
          rows="4"
          required 
        />

        <label>Violation Types (comma separated)</label>
        <input 
          name="violation_types" 
          value={form.violation_types}
          onChange={handleChange} 
          placeholder="e.g., excessive force, arbitrary detention"
        />

        <label>Country</label>
        <input 
          name="country" 
          value={form.country}
          onChange={handleChange} 
          placeholder="Country where incident occurred"
        />

        <label>Region/State</label>
        <input 
          name="region" 
          value={form.region}
          onChange={handleChange} 
          placeholder="Region or state"
        />

        <label>Reporter Name (optional)</label>
        <input 
          name="reporter_name" 
          value={form.reporter_name}
          onChange={handleChange} 
          placeholder="Leave blank for anonymous reporting"
        />

        <label>Reporter Contact (optional)</label>
        <input 
          name="reporter_contact" 
          value={form.reporter_contact}
          onChange={handleChange} 
          placeholder="Email or phone number"
        />

        <label>Status</label>
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="new">New</option>
          <option value="under_investigation">Under Investigation</option>
          <option value="verified">Verified</option>
          <option value="resolved">Resolved</option>
        </select>

        <button type="submit">Submit Report</button>
      </form>
    </div>
  );
}

export default ReportForm;