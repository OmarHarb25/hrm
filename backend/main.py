from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import cases, reports, analytics
from routers import uploads, analytics, individuals


from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(cases.router)
app.include_router(reports.router)
app.include_router(individuals.router)
app.include_router(analytics.router)
app.include_router(uploads.router)
app.include_router(analytics.router)
app.include_router(individuals.router)
