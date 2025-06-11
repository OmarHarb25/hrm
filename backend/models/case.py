from pydantic import BaseModel, Field, validator
from typing import List, Optional, Literal, Union
from datetime import datetime

class Location(BaseModel):
    country: str
    region: Optional[str] = None
    coordinates: List[float] = Field(default=[0.0, 0.0])  # [longitude, latitude]
    
    @validator('coordinates')
    def validate_coordinates(cls, v):
        if len(v) != 2:
            raise ValueError('Coordinates must be a list of exactly 2 numbers [longitude, latitude]')
        return v

class Perpetrator(BaseModel):
    name: str
    type: str

class Evidence(BaseModel):
    type: Literal["photo", "video", "document"]
    url: str
    description: Optional[str] = None
    date_captured: Optional[Union[datetime, str]] = None

class Case(BaseModel):
    case_id: str
    title: str
    description: str
    violation_types: List[str]
    status: Literal["new", "under_investigation", "resolved"] = "new"
    priority: Optional[str] = None
    location: Location
    date_occurred: Union[datetime, str]
    date_reported: Union[datetime, str]
    victims: List[str] = Field(default_factory=list)
    perpetrators: List[Perpetrator] = Field(default_factory=list)
    evidence: List[Evidence] = Field(default_factory=list)
    created_by: str
    created_at: Union[datetime, str] = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: Union[datetime, str] = Field(default_factory=lambda: datetime.utcnow().isoformat())
    
    @validator('date_occurred', 'date_reported', 'created_at', 'updated_at', pre=True)
    def parse_dates(cls, v):
        if isinstance(v, str):
            try:
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except:
                return v
        return v
    
    @validator('violation_types', pre=True)
    def parse_violation_types(cls, v):
        if isinstance(v, str):
            return [item.strip() for item in v.split(',') if item.strip()]
        return v