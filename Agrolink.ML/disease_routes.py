from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import io
import torch

from disease_model import processor, model, device, clean_label

router = APIRouter()

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        # torchvision transform returns a tensor directly
        input_tensor = processor(image).unsqueeze(0).to(device)  # [1, 3, 224, 224]

        with torch.no_grad():
            outputs = model(pixel_values=input_tensor)
            probs = torch.nn.functional.softmax(outputs.logits, dim=1)

        top_prob, top_idx = torch.max(probs, dim=1)

        predicted_class = model.config.id2label[top_idx.item()]
        confidence = float(top_prob.item()) * 100

        return {
            "predicted_class_raw": predicted_class,
            "predicted_class": clean_label(predicted_class),
            "confidence": round(confidence, 2)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))