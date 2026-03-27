from fastapi import FastAPI
from pydantic import BaseModel
from typing import List


from pipeline import run_pipeline

app = FastAPI()


# --------------------
# Request schema
# --------------------
class CropRequest(BaseModel):
    features: List[float]  # [N,P,K,temp,humidity,ph,rainfall]
class QueryRequest(BaseModel):
    query: str


# --------------------
# Response schema
# --------------------
class Fertilizer(BaseModel):
    fertilizer: str
    fert_prob: float
    score: float


class CropResult(BaseModel):
    crop: str
    crop_prob: float
    yield_: float
    fertilizers: List[Fertilizer]


# --------------------
# Endpoint
# --------------------



@app.get("/")
def root():
    return {"status": "AgroLink RAG API is running"}

@app.post("/ask")
def ask(request: QueryRequest):
    answer = run_pipeline(request.query)
    return {"answer": answer}