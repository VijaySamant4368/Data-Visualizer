import os
import pandas as pd
from fastapi import HTTPException, APIRouter, Depends
from app.auth.jwt import get_current_user
from app.routes.api.files import get_file_by_id

router = APIRouter()
@router.get("/download/{file_id}", response_model=dict)
async def get_full_file_by_id(file_id: str, user_id:str = Depends(get_current_user)) -> dict:
    
    metadata = await get_file_by_id(file_id)
    if metadata["owner"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to download this file")
    file_path = os.path.join("CSVs", user_id, f"{file_id}.csv")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="CSV file not found on disk")
    
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading CSV: {str(e)}")
    
    return {
        "metadata": metadata,
        "columns": df.columns.tolist(),
        "data": df.values.tolist()
    }
