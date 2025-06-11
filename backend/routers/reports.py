from fastapi import APIRouter, HTTPException
from typing import Optional
from models.incident import IncidentReport
from database import db

router = APIRouter()

@router.post("/reports/")
async def create_report(report: IncidentReport):
    report_dict = report.dict()
    result = await db["incident_reports"].insert_one(report_dict)
    return {"id": str(result.inserted_id)}

@router.get("/reports/")
async def list_reports(
    status: Optional[str] = None,
    country: Optional[str] = None,
    violation: Optional[str] = None
):
    query = {}
    if status:
        query["status"] = status
    if country:
        query["incident_details.location.country"] = country
    if violation:
        query["incident_details.violation_types"] = violation

    reports = await db["incident_reports"].find(query).to_list(100)
    for r in reports:
        r["_id"] = str(r["_id"])
    return reports

@router.put("/reports/{report_id}")
async def update_report(report_id: str, report: IncidentReport):
    """Update an entire report"""
    report_dict = report.dict()
    report_dict["updated_at"] = datetime.utcnow().isoformat()
    
    result = await db["incident_reports"].update_one(
        {"report_id": report_id}, 
        {"$set": report_dict}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Report not found or not updated")
    
    return {"msg": "Report updated successfully", "report_id": report_id}

@router.get("/reports/{report_id}")
async def get_report(report_id: str):
    """Get a specific report by ID"""
    report = await db["incident_reports"].find_one({"report_id": report_id})
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report["_id"] = str(report["_id"])
    return report