from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.config.database import user_collection
from app.auth.hashing import verify_password
from app.auth.jwt import create_access_token

router = APIRouter()

class LoginData(BaseModel):
    email: EmailStr
    password: str

@router.post("/login")
async def login(data: LoginData):
    user = await user_collection.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"])}, no_expiry=True)

    return {"access_token": token, "token_type": "bearer"}
