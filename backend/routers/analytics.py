from fastapi import APIRouter
from database import db

router = APIRouter()

@router.get("/analytics/violations")
async def count_violations():
    pipeline = [
        {"$unwind": "$incident_details.violation_types"},
        {"$group": {"_id": "$incident_details.violation_types", "count": {"$sum": 1}}}
    ]
    data = await db["incident_reports"].aggregate(pipeline).to_list(50)
    return data


@router.get("/analytics/timeline")
async def report_timeline():
    pipeline = [
        {
            "$group": {
                "_id": {
                    "$dateToString": { "format": "%Y-%m", "date": "$created_at" }
                },
                "count": { "$sum": 1 }
            }
        },
        { "$sort": { "_id": 1 } }
    ]
    return await db["incident_reports"].aggregate(pipeline).to_list(50)
@router.get("/analytics/geodata")
async def report_geodata():
    pipeline = [
        {
            "$group": {
                "_id": "$incident_details.location.city",
                "count": { "$sum": 1 },
                "coordinates": { "$first": "$incident_details.location.coordinates" }
            }
        }
    ]
    return await db["incident_reports"].aggregate(pipeline).to_list(50)
