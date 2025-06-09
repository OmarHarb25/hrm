from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class Location(BaseModel):
    country: str
    region: Optional[str]
    coordinates: dict

class Perpetrator(BaseModel):
    name: str
    type: str

class Evidence(BaseModel):
    type: Literal["photo", "video", "document"]
    url: str
    description: Optional[str]
    date_captured: Optional[datetime]

class Case(BaseModel):
    case_id: str
    title: str
    description: str
    violation_types: List[str]
    status: Literal["new", "under_investigation", "resolved"]
    priority: Optional[str]
    location: Location
    date_occurred: datetime
    date_reported: datetime
    victims: List[str]
    perpetrators: List[Perpetrator]
    evidence: List[Evidence]
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
