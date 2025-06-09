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

@router.patch("/reports/{report_id}")
async def update_report_status(report_id: str, status: str):
    result = await db["incident_reports"].update_one({"report_id": report_id}, {"$set": {"status": status}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Report not updated")
    return {"msg": "Report status updated"}

@router.get("/reports/analytics")
async def analytics():
    pipeline = [
        {"$unwind": "$incident_details.violation_types"},
        {"$group": {"_id": "$incident_details.violation_types", "count": {"$sum": 1}}}
    ]
    data = await db["incident_reports"].aggregate(pipeline).to_list(length=10)
    return data
