# Human Rights Monitor - Management Information System

## Project Overview

The Human Rights Monitor Management Information System (MIS) is a secure, data-driven platform designed to document, track, and analyze human rights violations. This comprehensive system enables human rights organizations to effectively manage and process critical information related to human rights abuses.

## Purpose & Goals

The system aims to:
- **Document Human Rights Violations**: Record cases of arbitrary detention, forced displacement, torture, and other abuses
- **Secure Data Management**: Manage victim and witness data with privacy protection and anonymity options
- **Multi-Source Reporting**: Process incident reports from web interfaces, mobile applications, and NGO partners
- **Data Analytics**: Generate visual insights through interactive charts, maps, and trend analysis
- **Legal Support**: Provide structured evidence and documentation to support legal actions and advocacy

## Key Features

### 🔍 Case Management System
- Complete CRUD operations for human rights cases
- Advanced search and filtering (by date, location, violation type)
- Case status tracking (new → under_investigation → resolved)
- File attachments support (PDFs, images, videos)
- Case priority management

### 📋 Incident Reporting Module
- Secure incident submission forms
- Anonymous reporting capabilities
- Media upload functionality (photos, videos, documents)
- Geolocation tagging and mapping
- Multi-channel report processing

### 👥 Victim/Witness Database
- Secure victim and witness record management
- Role-based access control for sensitive data
- Risk assessment tracking (low/medium/high)
- Pseudonym support for anonymity protection
- Support services tracking

### 📊 Data Analysis & Visualization
- Interactive dashboards showing violation trends
- Geographic hotspot mapping
- Time-series analysis of incidents
- Exportable reports (PDF/Excel)
- Violation type and location analytics

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT tokens
- **File Storage**: Local/Cloud storage for evidence
- **API Documentation**: OpenAPI/Swagger

### Frontend
- **Framework**: React.js
- **UI Components**: Modern responsive design
- **Charts**: Interactive data visualizations
- **Maps**: Geolocation and hotspot mapping

## Project Structure

```
human-rights-monitor/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── auth.py                 # Authentication middleware
│   ├── database.py             # MongoDB connection
│   ├── models/                 # Data models
│   │   ├── case.py
│   │   ├── incident.py
│   │   └── individuals.py
│   ├── routers/                # API endpoints
│   │   ├── analytics.py
│   │   ├── cases.py
│   │   ├── individuals.py
│   │   ├── reports.py
│   │   └── uploads.py
│   ├── uploads/                # File storage
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/              # React components
│   │   ├── services/           # API integration
│   │   └── App.js              # Main application
│   ├── public/
│   └── package.json            # Node.js dependencies
└── README.md
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- MongoDB 4.4+

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure MongoDB**
   - Install and start MongoDB
   - Create database: `human_rights_monitor`
   - Update connection string in `database.py` if needed

5. **Run the backend server**
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000`

## API Documentation

Once the backend is running, access the interactive API documentation at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Key API Endpoints

### Case Management
- `POST /cases/` - Create a new case
- `GET /cases/` - List all cases with filters
- `GET /cases/{case_id}` - Retrieve specific case
- `PATCH /cases/{case_id}` - Update case status

### Incident Reports
- `POST /reports/` - Submit incident report
- `GET /reports/` - List reports with filters
- `GET /reports/analytics` - Report statistics

### Victims/Witnesses
- `POST /victims/` - Add victim/witness
- `GET /victims/{victim_id}` - Retrieve victim details (authorized access)
- `PATCH /victims/{victim_id}` - Update risk assessment

### Analytics
- `GET /analytics/violations` - Violation statistics
- `GET /analytics/geodata` - Geographic data for mapping
- `GET /analytics/timeline` - Time-series analysis

## Database Schema

The system uses MongoDB with the following main collections:
- **cases**: Main case records with violation details
- **incident_reports**: Submitted incident reports
- **individuals**: Victim and witness information
- **case_status_history**: Case status change tracking
- **report_evidence**: Attached media and documents

## Security Features

- **Authentication**: JWT-based user authentication
- **Authorization**: Role-based access control
- **Data Encryption**: Sensitive data encryption
- **Anonymous Reporting**: Privacy-protected incident submission
- **Risk Assessment**: Automated threat level evaluation

## Usage Examples

### Creating a New Case
```python
case_data = {
    "title": "Arbitrary Detention Case",
    "description": "Detention without legal basis",
    "violation_types": ["arbitrary_detention"],
    "location": {
        "country": "Syria",
        "region": "Damascus"
    },
    "priority": "high"
}
```

### Submitting an Incident Report
```python
report_data = {
    "incident_details": {
        "date": "2023-05-15",
        "location": {
            "country": "Yemen",
            "city": "Sana'a"
        },
        "description": "Peaceful protest disruption",
        "violation_types": ["freedom_of_assembly"]
    },
    "anonymous": True
}
```

## Contributing

This project was developed as part of COMP4382 coursework. The system is designed to support human rights documentation and advocacy efforts through efficient data management and analysis capabilities.

## Data Privacy & Ethics

This system handles sensitive human rights data. All data should be:
- Collected with informed consent
- Stored securely with appropriate encryption
- Accessed only by authorized personnel
- Used solely for human rights documentation and advocacy

## License

This project is developed for educational and humanitarian purposes. Please ensure compliance with local data protection regulations when deploying in production environments.

---

**Note**: This system is designed to support human rights organizations in their critical work of documenting violations and supporting victims. Proper security measures and ethical guidelines should always be followed when handling sensitive human rights data.
