from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.database import Base, engine
from app import models


def _get_cors_origins() -> list[str] | None:
    if settings.cors_origins.strip() == "*":
        return ["*"]
    origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    return origins or None


app = FastAPI(title=settings.app_name)

cors_origins = _get_cors_origins()
if cors_origins:
    allow_credentials = cors_origins != ["*"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=allow_credentials,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.on_event("startup")
def startup() -> None:
    if settings.auto_create_tables:
        Base.metadata.create_all(bind=engine)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


app.include_router(api_router)
app.include_router(api_router, prefix="/api")
