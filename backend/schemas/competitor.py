from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class CompanyBase(BaseModel):
    company_name: str
    industry: Optional[str] = None
    country: Optional[str] = None
    description: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyOut(CompanyBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)

class CompareRequest(BaseModel):
    company_a: str
    company_b: str
