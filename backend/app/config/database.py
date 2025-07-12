from pydantic import BaseModel, EmailStr
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

from dotenv import load_dotenv
import os
load_dotenv()

# MongoDB setup
MONGO_URI = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(MONGO_URI)
db = client["userData"]
user_collection = db["user-details"]
file_collection = db["file-details"]

class UserDetails(BaseModel):
    username: str
    email: EmailStr
    passwordHash: str

class UserSignupDetails(BaseModel):
    username: str
    email: EmailStr
    password: str

class FileDetails(BaseModel):
    title: str
    description: Optional[str] = None
    hasHeaders: bool
    owner: str
    uploadDate: datetime

# # FastAPI app
# app = FastAPI()

# @app.post("/files", response_model=FileDetails)
# async def create_file(file: FileDetails):
#     file_dict = file.dict()
#     result = await file_collection.insert_one(file_dict)
#     file_dict["_id"] = str(result.inserted_id)
#     return file_dict
