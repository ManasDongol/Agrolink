from fastapi import FastAPI
from typing import Annotated
from pydantic import BaseModel, Field
from predict import predict_crop

app = FastAPI(
    title="AgroLink ML Service",
    description="Crop recommendation model for AgroLink",
    version="1.0.0"
)


class CropRequest(BaseModel):
    features: Annotated[list[float], Field(min_items=1)]


class CropResponse(BaseModel):
    prediction: int

@app.post("/predict", response_model=CropResponse)
def predict(data: CropRequest):
    result = predict_crop(data.features)
    return {"prediction": result}
