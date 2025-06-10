import React, { useState, useEffect } from 'react';
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
    city: '',
    address: '',
    reporter_name: '',
    reporter_contact: '',
  });

  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null
  });

  const [mediaFiles, setMediaFiles] = useState([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, error: 'Geolocation is not supported by this browser.' }));
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null
        });
        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location.';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setLocation(prev => ({ ...prev, error: errorMessage }));
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    
    files.forEach(file => {
     
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported for ${file.name}.`);
        return;
      }
      
      validFiles.push({
        file: file,
        name: file.name,
        type: file.type,
        size: file.size,
        id: Date.now() + Math.random() 
      });
    });
    
    setMediaFiles(prev => [...prev, ...validFiles]);
  };

  const removeMediaFile = (fileId) => {
    setMediaFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!form.report_id || !form.title || !form.description) {
      alert('Please fill in all required fields (Report ID, Title, Description)');
      return;
    }

    const processedMedia = [];
    const processedDocuments = [];
    const processedEvidence = [];

    try {
      for (const mediaFile of mediaFiles) {
        const base64Data = await fileToBase64(mediaFile.file);
        
        const fileData = {
          filename: mediaFile.name,
          content_type: mediaFile.type,
          size: mediaFile.size,
          data: base64Data,
          uploaded_at: new Date().toISOString(),
          description: `Evidence file: ${mediaFile.name}`
        };

        const evidenceItem = {
          type: mediaFile.type.startsWith('image/') ? 'photo' : 
                mediaFile.type.startsWith('video/') ? 'video' : 'document',
          url: `/evidence/${form.report_id}-${Date.now()}-${mediaFile.name}`, 
          description: `${mediaFile.type.startsWith('image/') ? 'Photo' : 
                       mediaFile.type.startsWith('video/') ? 'Video' : 'Document'}: ${mediaFile.name}`,
          date_captured: new Date().toISOString(),
          file_data: fileData 
        };

        processedEvidence.push(evidenceItem);

        if (mediaFile.type.startsWith('image/') || mediaFile.type.startsWith('video/')) {
          processedMedia.push(fileData);
        } else {
          processedDocuments.push(fileData);
        }
      }
    } catch (error) {
      alert('Error processing media files. Please try again.');
      console.error('Media processing error:', error);
      return;
    }

    const payload = {
      report_id: form.report_id,
      title: form.title,
      description: form.description,
      status: form.status,
      priority: 'medium',
      reporter_type: 'individual',
      anonymous: !form.reporter_name,
      
      contact_info: {
        email: form.reporter_contact || '',
        phone: '',
        address: '',
        preferred_contact: 'email'
      },
      
      incident_details: {
        description: form.description,
        date: new Date().toISOString(),
        violation_types: form.violation_types ? form.violation_types.split(',').map(t => t.trim()) : [],
        date_occurred: new Date().toISOString(),
        date_reported: new Date().toISOString(),
        location: {
          country: form.country || 'Unknown',
          region: form.region || 'Unknown',
          city: form.city || 'Unknown',
          address: form.address || 'Unknown',
          coordinates: {
            type: 'Point',
            coordinates: location.latitude && location.longitude 
              ? [location.longitude, location.latitude] 
              : [0, 0]
          },
          location_accuracy: location.accuracy,
          location_method: location.latitude ? 'gps' : 'manual'
        },
        victims: [],
        perpetrators: [],
        witnesses: [],
        evidence: processedEvidence, 
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
      
      evidence: processedEvidence,
      
  
      documents: processedDocuments,
      media: processedMedia,
      tags: [],
      source: 'manual_entry',
      verified: false,
      public: false,
      follow_up_required: false,
      assigned_to: null,
      created_by: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      

      geolocation: location.latitude ? {
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy
        },
        timestamp: new Date().toISOString(),
        method: 'browser_geolocation'
      } : null
    };

    try {
      await submitReport(payload);
      alert('Report submitted successfully!');
      
     
      setForm({
        report_id: '',
        title: '',
        description: '',
        violation_types: '',
        status: 'new',
        country: '',
        region: '',
        city: '',
        address: '',
        reporter_name: '',
        reporter_contact: '',
      });
      setMediaFiles([]);
      setLocation({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: null
      });
    } catch (error) {
      console.error('=== SUBMISSION ERROR ===');
      console.error('Error:', error);
      console.error('Response:', error.response?.data);
      
      let errorMessage = 'Unknown error occurred';
      if (error.response?.data?.detail) {
    
        const details = error.response.data.detail;
        if (Array.isArray(details)) {
          errorMessage = details.map(d => `${d.loc.join('.')}: ${d.msg}`).join('\n');
        } else {
          errorMessage = details;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Error submitting report:\n${errorMessage}`);
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

        {}
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
                marginBottom: '10px'
              }}
            >
              {isGettingLocation ? 'Getting Location...' : 'Get Current Location'}
            </button>
            
            {location.latitude && location.longitude && (
              <div style={{ backgroundColor: '#d4edda', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
                <strong>Current Location:</strong><br/>
                Latitude: {location.latitude.toFixed(6)}<br/>
                Longitude: {location.longitude.toFixed(6)}<br/>
                Accuracy: ±{Math.round(location.accuracy)}m
              </div>
            )}
            
            {location.error && (
              <div style={{ backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
                <strong>Location Error:</strong> {location.error}
              </div>
            )}
          </div>

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

          <label>City</label>
          <input 
            name="city" 
            value={form.city}
            onChange={handleChange} 
            placeholder="City where incident occurred"
          />

          <label>Address/Location Details</label>
          <input 
            name="address" 
            value={form.address}
            onChange={handleChange} 
            placeholder="Specific address or location details"
          />
        </div>

        {}
        <div className="media-section">
          <h3>Evidence & Media</h3>
          <label>Upload Files (Photos, Videos, Documents)</label>
          <input 
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            onChange={handleMediaUpload}
            style={{ marginBottom: '10px' }}
          />
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
            Supported formats: Images (JPG, PNG, GIF), Videos (MP4, AVI, MOV), Documents (PDF, DOC, TXT)<br/>
            Maximum file size: 10MB per file
          </div>

          {mediaFiles.length > 0 && (
            <div className="media-files-list">
              <h4>Uploaded Files ({mediaFiles.length}):</h4>
              {mediaFiles.map(file => (
                <div key={file.id} style={{
                  border: '1px solid #ddd',
                  padding: '10px',
                  marginBottom: '5px',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong>{file.name}</strong><br/>
                    <small>Type: {file.type} | Size: {formatFileSize(file.size)}</small>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeMediaFile(file.id)}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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

        <button type="submit" style={{
          backgroundColor: '#28a745',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          marginTop: '20px'
        }}>
          Submit Report
        </button>
      </form>
    </div>
  );
}

export default ReportForm;