"""
CrimeGraph AI — Backend Application Main Entrypoint
FastAPI server connecting Databricks Lakehouse, AI/NLP Extraction,
Criminal Knowledge Graph, Entire Integration, and Investigation Dashboard APIs.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.app.api.router import router
from backend.app.services.case_service import case_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("==================================================")
    print("CrimeGraph AI — Initializing Investigation Server")
    print("==================================================")
    case_service.bootstrap_system()
    yield
    print("[CrimeGraph AI] Backend shutdown complete.")

app = FastAPI(
    title="CrimeGraph AI — Investigative Intelligence Platform",
    description="Backend APIs for criminal network analysis, Databricks Medallion pipeline, AI entity extraction, graph analytics, and What-If investigation simulator.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Router
app.include_router(router)

@app.get("/")
def root_status():
    return {
        "platform": "CrimeGraph AI",
        "tagline": "From fragmented crime data to connected investigative intelligence.",
        "status": "OPERATIONAL",
        "version": "1.0.0",
        "lakehouse_status": "ONLINE",
        "graph_engine": "NetworkX In-Memory MultiDiGraph (Neo4j Ready)",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
