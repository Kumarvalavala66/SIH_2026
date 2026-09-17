import os
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# Dynamically build the absolute path to backend/data/sih_projects.db
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "data", "sih_projects.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False} # Needed for SQLite + FastAPI
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Define the Project table schema
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, unique=True, index=True)
    district = Column(String, index=True)
    state = Column(String)
    work_type = Column(String)
    sanctioned_amount = Column(Float)
    spent_amount = Column(Float)
    physical_progress = Column(Integer)
    planned_days = Column(Integer)
    actual_days = Column(Integer)
    inspection_count = Column(Integer)
    latitude = Column(Float)
    longitude = Column(Float)