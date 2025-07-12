from fastapi import HTTPException, File, UploadFile, Form, APIRouter, Depends
from typing import Optional
import pandas as pd
import os
from datetime import datetime, timezone
from app.auth.jwt import get_current_user
from app.routes.api.files import save_file_details

router = APIRouter()

dummyVals = {
    "dataSet": [[1, 2, 3], [40, 5, 16], [17, 8, 90]],
    "columns": ["col1", "col2", "col3"],
    "title": "title",
    "description": "description",
}

@router.post("/upload")
async def upload_csv(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(""),
    hasHeaders: bool = Form(False),
    user_id: str = Depends(get_current_user),
    defaultValue = Form(None)
):
    df = pd.read_csv(file.file, header=0 if hasHeaders else None)
    if defaultValue is not None:
        df.fillna(defaultValue, inplace=True)
    else:
        if df.isnull().any().any():
            raise HTTPException(
                status_code=400,
                detail="CSV contains missing values. Please fill them or specify a default."
            )
    try:
        df = df.apply(pd.to_numeric, errors="raise")
    except  Exception as e:
        raise HTTPException(
        status_code=400,
        detail=f"CSV contains non-numeric value: {str(e)}"
    )
    if df.shape[1]<5:
        raise HTTPException(
        status_code=400,
        detail="CSV must contain at least 5 fully numeric columns",
    ) 

    #tog et Column names
    if not hasHeaders:
        df.columns = [f"col{i+1}" for i in range(df.shape[1])]
    else:
        new_columns = []
        for i, col in enumerate(df.columns):
            if not col or str(col).startswith("Unnamed"):
                new_columns.append(f"col{i+1}")
            else:
                new_columns.append(str(col).strip())
        df.columns = new_columns

    file_data_for_DB = {
        "title": title,
        "description": description,
        "hasHeaders": hasHeaders,
        "owner": user_id,
        "uploadDate": datetime.now(timezone.utc)
    }
    file_id = await save_file_details(file_data_for_DB)
    folder_path = os.path.join("CSVs", user_id)
    os.makedirs(folder_path, exist_ok=True)
    file_path = os.path.join(folder_path, f"{file_id}.csv")
    df.to_csv(file_path, index=False)

    my_file_data = {
        "dataSet": df.values.tolist(),       # 2D numeric array
        "columns": df.columns.tolist(),   # list of column names
        "title": title,
        "description": description,
        "file_id": file_id
    }
    # return dummyVals
    return my_file_data
