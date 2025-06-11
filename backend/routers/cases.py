from fastapi import APIRouter, HTTPException
from typing import Optional
from models.case import Case
from database import db
from datetime import datetime
import logging

router = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/cases/")
async def create_case(case: Case):
    try:
        logger.info(f"Received case data: {case}")
        
   
        try:
            case_dict = case.model_dump() 
        except AttributeError:
            case_dict = case.dict()  
            
        logger.info(f"Case dict: {case_dict}")
        
       
        if isinstance(case_dict.get('date_occurred'), datetime):
            case_dict['date_occurred'] = case_dict['date_occurred'].isoformat()
        if isinstance(case_dict.get('date_reported'), datetime):
            case_dict['date_reported'] = case_dict['date_reported'].isoformat()
        if isinstance(case_dict.get('created_at'), datetime):
            case_dict['created_at'] = case_dict['created_at'].isoformat()
        if isinstance(case_dict.get('updated_at'), datetime):
            case_dict['updated_at'] = case_dict['updated_at'].isoformat()
            
        # Handle evidence datetime fields
        if 'evidence' in case_dict:
            for evidence in case_dict['evidence']:
                if isinstance(evidence.get('date_captured'), datetime):
                    evidence['date_captured'] = evidence['date_captured'].isoformat()
        
        result = await db["cases"].insert_one(case_dict)
        return {"id": str(result.inserted_id), "case_id": case_dict.get("case_id")}
    except Exception as e:
        logger.error(f"Error creating case: {e}")
        logger.error(f"Case data that failed: {case}")
        raise HTTPException(status_code=500, detail=f"Error creating case: {str(e)}")

@router.get("/cases/{case_id}")
async def get_case(case_id: str):
    try:
        case = await db["cases"].find_one({"case_id": case_id})
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        case["_id"] = str(case["_id"])
        return case
    except Exception as e:
        logger.error(f"Error fetching case {case_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cases/")
async def list_cases(
    status: Optional[str] = None,
    country: Optional[str] = None,
    violation: Optional[str] = None
):
    try:
        query = {}
        if status:
            query["status"] = status
        if country:
            query["location.country"] = country
        if violation:
            query["violation_types"] = {"$in": [violation]}  

        logger.info(f"Query: {query}")
        cases = await db["cases"].find(query).to_list(100)
        for c in cases:
            c["_id"] = str(c["_id"])
        return cases
    except Exception as e:
        logger.error(f"Error listing cases: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/cases/{case_id}")
async def update_case_status(case_id: str, update_data: dict):
    try:

        if isinstance(update_data, dict):
            if 'status' in update_data:
                status = update_data['status']
            else:
          
                status = update_data.get('status', 'new')
        else:
            status = str(update_data)
            
        result = await db["cases"].update_one(
            {"case_id": case_id},
            {"$set": {"status": status, "updated_at": datetime.utcnow().isoformat()}}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Case not found or not updated")

        await db["case_status_history"].insert_one({
            "case_id": case_id,
            "status": status,
            "changed_at": datetime.utcnow().isoformat()
        })
        return {"msg": "Case status updated and tracked."}
    except Exception as e:
        logger.error(f"Error updating case {case_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/cases/{case_id}")
async def update_full_case(case_id: str, case: Case):
    try:
        try:
            case_dict = case.model_dump() 
        except AttributeError:
            case_dict = case.dict()  
            
        
        if isinstance(case_dict.get('date_occurred'), datetime):
            case_dict['date_occurred'] = case_dict['date_occurred'].isoformat()
        if isinstance(case_dict.get('date_reported'), datetime):
            case_dict['date_reported'] = case_dict['date_reported'].isoformat()
        if isinstance(case_dict.get('created_at'), datetime):
            case_dict['created_at'] = case_dict['created_at'].isoformat()
        if isinstance(case_dict.get('updated_at'), datetime):
            case_dict['updated_at'] = case_dict['updated_at'].isoformat()
            
        # Handle evidence datetime fields
        if 'evidence' in case_dict:
            for evidence in case_dict['evidence']:
                if isinstance(evidence.get('date_captured'), datetime):
                    evidence['date_captured'] = evidence['date_captured'].isoformat()
        
        # Update the case
        result = await db["cases"].update_one(
            {"case_id": case_id},
            {"$set": case_dict}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Case not found or not updated")
            
        return {"msg": "Case updated successfully", "case_id": case_id}
    except Exception as e:
        logger.error(f"Error updating full case {case_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/cases/{case_id}")
async def delete_case(case_id: str):
    try:
        result = await db["cases"].delete_one({"case_id": case_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Case not found")
        return {"msg": "Case archived"}
    except Exception as e:
        logger.error(f"Error deleting case {case_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))