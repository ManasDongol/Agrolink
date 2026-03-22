from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from predict import predict

app = FastAPI()


# --------------------
# Request schema
# --------------------
class CropRequest(BaseModel):
    features: List[float]  # [N,P,K,temp,humidity,ph,rainfall]


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
@app.post("/predict")
def get_prediction(data: CropRequest):

    results = predict(data.features)

    # rename "yield" -> "yield_" (because yield is reserved in python)
    for r in results:
        r["yield_"] = r.pop("yield")

    return {
        "results": results
    }