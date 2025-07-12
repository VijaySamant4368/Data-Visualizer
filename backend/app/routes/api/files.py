from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId
from app.config.database import file_collection
from app.auth.jwt import get_current_user
import os

router = APIRouter()

async def save_file_details(file: dict) -> str:
    print(type(file))
    result = await file_collection.insert_one(file)
    return str(result.inserted_id)

async def get_all_files() -> List[dict]:
    files = await file_collection.find().to_list(100)
    for f in files:
        f["id"] = str(f["_id"])
        del f["_id"]
    return files

@router.get("/files", response_model=List[dict])
async def read_all_files():
    return await get_all_files()

@router.get("/files/by-user", response_model=List[dict])
async def get_all_files_by_user(user_id: str = Depends(get_current_user)):
    files = await file_collection.find({"owner": user_id}).sort("uploadDate", -1).to_list(100)
    for file in files:
        file["id"] = str(file["_id"])
        del file["_id"]
    return files

# Get a file by ID
async def get_file_by_id(file_id: str) -> dict:
    try:
        obj_id = ObjectId(file_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid file ID format")

    file = await file_collection.find_one({"_id": obj_id})
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    file["id"] = str(file["_id"])
    del file["_id"]
    return file

async def delete_file(file_id: str, user_id: str) -> bool:
    file = await file_collection.find_one({"_id": ObjectId(file_id), "owner": user_id})
    print({"_id": file_id, "owner": user_id})
    if not file:
        return False
    file_path = os.path.join("CSVs", user_id, f"{file_id}.csv")
    try:
        os.remove(file_path)
    except FileNotFoundError:
        pass  # Already gone

    res = await file_collection.delete_one({"_id": ObjectId(file_id)})
    print("res")
    print(res)
    return True

@router.delete("/files/{file_id}")
async def delete_file_route(file_id: str, user=Depends(get_current_user)):
    success = await delete_file(file_id, user)  # Check ownership too
    print(user)
    if not success:
        raise HTTPException(status_code=404, detail="File not found or not owned by user")
    return {"message": "File deleted"}