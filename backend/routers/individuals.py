from fastapi import APIRouter, HTTPException ,Body ,Depends
from models.individuals import Individual
from database import db
from bson import ObjectId
from auth import get_user_role




router = APIRouter()



@router.post("/individuals/")
async def add_individual(data: Individual, role: str = Depends(get_user_role)):
    if role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can create individuals.")
    result = await db["individuals"].insert_one(data.dict())
    return {"id": str(result.inserted_id)}

@router.get("/individuals/")
async def list_individuals():
    docs = await db["individuals"].find().to_list(100)
    for d in docs:
        d["_id"] = str(d["_id"])
    return docs

@router.get("/individuals/{id}")
async def get_individual(id: str):
    doc = await db["individuals"].find_one({"_id": id})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    doc["_id"] = str(doc["_id"])
    return doc

@router.patch("/individuals/{id}/risk")
async def update_risk_assessment(id: str, data: dict = Body(...)):
    result = await db["individuals"].update_one(
        {"_id": ObjectId(id)},
        {"$set": {"risk_assessment": data, "updated_at": datetime.utcnow()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Individual not found or not updated.")
    return {"msg": "Risk assessment updated."}