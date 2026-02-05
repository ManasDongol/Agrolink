from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from predict import predict_crop, predict_fertilizer

app = FastAPI()


class CropRequest(BaseModel):
    features: List[float]


class PredictionResponse(BaseModel):
    crop: int
    fertilizer: int


@app.post("/predict", response_model=PredictionResponse)
def predict(data: CropRequest):

    crop_id = predict_crop(data.features)
    fert_id = predict_fertilizer(data.features, crop_id)

    return {
        "crop": crop_id,
        "fertilizer": fert_id
    }
