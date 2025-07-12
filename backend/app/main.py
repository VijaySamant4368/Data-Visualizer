from fastapi import FastAPI
# from app.routes.hello import router as hello_router
from fastapi.middleware.cors import CORSMiddleware
from app.routes.upload import router as upload_router
from app.routes.download import router as download_router
from app.routes.api.files import router as api_router
from app.routes.auth.signup import router as signup_router
from app.routes.auth.login import router as login_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # Allow any origin
    allow_credentials=True,
    allow_methods=["*"],           # Allow all HTTP methods
    allow_headers=["*"],           # Allow all headers
)

# app.include_router(hello_router)
app.include_router(upload_router, prefix="/api")
app.include_router(download_router, prefix="/api")
app.include_router(api_router, prefix="/api")
app.include_router(signup_router, prefix="/auth")
app.include_router(login_router, prefix="/auth")