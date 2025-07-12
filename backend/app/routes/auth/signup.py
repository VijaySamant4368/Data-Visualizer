from fastapi import APIRouter, HTTPException
from app.config.database import user_collection, UserSignupDetails
from app.auth.hashing import hash_password
from app.auth.jwt import create_access_token

router = APIRouter()

@router.post("/signup")
async def signup(user: UserSignupDetails):
    existing = await user_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(user.password)
    new_user = {
        "email": user.email,
        "username": user.username,
        "password_hash": hashed,
    }
    result = await user_collection.insert_one(new_user)

    token = create_access_token({"sub": str(result.inserted_id)}, no_expiry=True)

    return {"access_token": token, "token_type": "bearer"}