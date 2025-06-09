from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ContactInfo(BaseModel):
    email: Optional[str]
    phone: Optional[str]
    preferred_contact: Optional[str]

class IncidentLocation(BaseModel):
    country: str
    city: str
    coordinates: dict

class IncidentDetails(BaseModel):
    date: datetime
    location: IncidentLocation
    description: str
    violation_types: List[str]

class IncidentEvidence(BaseModel):
    type: str
    url: str
    description: Optional[str]

class IncidentReport(BaseModel):
    report_id: str
    reporter_type: str
    anonymous: bool
    contact_info: Optional[ContactInfo]
    incident_details: IncidentDetails
    evidence: List[IncidentEvidence]
    status: str = "new"
    assigned_to: Optional[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)