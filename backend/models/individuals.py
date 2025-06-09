from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class Individual(BaseModel):
    pseudonym: Optional[str]
    anonymous: bool
    demographics: dict
    contact_info: Optional[dict]
    cases_involved: List[str]
    risk_assessment: dict
    support_services: Optional[List[dict]]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
