from collections.abc import Generator

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    pass


def _is_vercel() -> bool:
    return bool(os.getenv("VERCEL") or os.getenv("VERCEL_URL"))


def _default_database_url() -> str:
    if _is_vercel():
        return "sqlite+pysqlite:////tmp/app.db"
    return "sqlite+pysqlite:///./app.db"


raw_database_url = settings.database_url
if _is_vercel() and raw_database_url and "@db:" in raw_database_url:
    raw_database_url = None

if raw_database_url and raw_database_url.startswith("postgres://"):
    raw_database_url = "postgresql+psycopg://" + raw_database_url[len("postgres://") :]
if raw_database_url and raw_database_url.startswith("postgresql://"):
    raw_database_url = "postgresql+psycopg://" + raw_database_url[len("postgresql://") :]

database_url = raw_database_url or _default_database_url()
connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
engine = create_engine(database_url, pool_pre_ping=True, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, class_=Session)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
