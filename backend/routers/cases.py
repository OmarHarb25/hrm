from fastapi import APIRouter, HTTPException
from typing import Optional
from models.case import Case
from database import db
from datetime import datetime
import logging

router = APIRouter()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/cases/")
async def create_case(case: Case):
    try:
        logger.info(f"Received case data: {case}")
        case_dict = case.dict()
        logger.info(f"Case dict: {case_dict}")
        result = await db["cases"].insert_one(case_dict)
        return {"id": str(result.inserted_id)}
    except Exception as e:
        logger.error(f"Error creating case: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cases/{case_id}")
async def get_case(case_id: str):
    case = await db["cases"].find_one({"case_id": case_id})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    case["_id"] = str(case["_id"])
    return case

@router.get("/cases/")
async def list_cases(
    status: Optional[str] = None,
    country: Optional[str] = None,
    violation: Optional[str] = None
):
    query = {}
    if status:
        query["status"] = status
    if country:
        query["location.country"] = country
    if violation:
        query["violation_types"] = violation

    cases = await db["cases"].find(query).to_list(100)
    for c in cases:
        c["_id"] = str(c["_id"])
    return cases

@router.patch("/cases/{case_id}")
async def update_case_status(case_id: str, status: str):
    result = await db["cases"].update_one(
        {"case_id": case_id},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Case not updated")

    # Track status change
    await db["case_status_history"].insert_one({
        "case_id": case_id,
        "status": status,
        "changed_at": datetime.utcnow()
    })
    return {"msg": "Case status updated and tracked."}

@router.delete("/cases/{case_id}")
async def delete_case(case_id: str):
    result = await db["cases"].delete_one({"case_id": case_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Case not found")
    return {"msg": "Case archived"}