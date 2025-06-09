from fastapi import APIRouter, File, UploadFile
import os
from uuid import uuid4

router = APIRouter()

UPLOAD_DIR = "uploads"

@router.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    # Create uploads directory if not exist
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Create a unique filename
    filename = f"{uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    return {"filename": filename, "url": f"/uploads/{filename}"}
