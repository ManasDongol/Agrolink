from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

from pipeline import run_pipeline
from disease_routes import router as disease_router

app = FastAPI()

# Include disease routes
app.include_router(disease_router, prefix="/disease", tags=["Disease Detection"])


class CropRequest(BaseModel):
    features: List[float]  # [N,P,K,temp,humidity,ph,rainfall]


class QueryRequest(BaseModel):
    query: str

class Fertilizer(BaseModel):
    fertilizer: str
    fert_prob: float
    score: float

class CropResult(BaseModel):
    crop: str
    
    yield_: float
    fertilizers: List[Fertilizer]



@app.get("/")
def root():
    return {"status": "AgroLink RAG API is running"}


# --------------------
# RAG / LLM endpoint
# --------------------
@app.post("/ask")
def ask(request: QueryRequest):
    answer = run_pipeline(request.query)
    return {"answer": answer}