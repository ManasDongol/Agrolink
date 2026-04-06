from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import io
import torch

from disease_model import processor, model, device, class_mapping, clean_label

router = APIRouter()


@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        # Validate it's actually an image (content_type can be None from some proxies)
        try:
            image = Image.open(io.BytesIO(contents)).convert("RGB")
        except Exception:
            raise HTTPException(status_code=400, detail="Uploaded file is not a valid image.")

        # Preprocess image
        input_tensor = processor(image).unsqueeze(0).to(device)  # [1, 3, 224, 224]

        # Run inference
        with torch.no_grad():
            outputs = model(input_tensor)  # raw logits tensor
            probs = torch.nn.functional.softmax(outputs, dim=1)

        # Get top prediction
        top_prob, top_idx = torch.max(probs, dim=1)

        raw_label = class_mapping[str(top_idx.item())]
        confidence = float(top_prob.item()) * 100

        return {
            "predicted_class_raw": raw_label,
            "predicted_class": clean_label(raw_label),
            "confidence": round(confidence, 2)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict/top5")
async def predict_top5(file: UploadFile = File(...)):
    """Returns top 5 predictions with confidence scores."""
    try:
        contents = await file.read()

        try:
            image = Image.open(io.BytesIO(contents)).convert("RGB")
        except Exception:
            raise HTTPException(status_code=400, detail="Uploaded file is not a valid image.")

        input_tensor = processor(image).unsqueeze(0).to(device)

        with torch.no_grad():
            outputs = model(input_tensor)
            probs = torch.nn.functional.softmax(outputs, dim=1)

        top5_probs, top5_idx = torch.topk(probs, k=5, dim=1)

        results = []
        for prob, idx in zip(top5_probs[0], top5_idx[0]):
            raw_label = class_mapping[str(idx.item())]
            results.append({
                "predicted_class_raw": raw_label,
                "predicted_class": clean_label(raw_label),
                "confidence": round(float(prob.item()) * 100, 2)
            })

        return {"predictions": results}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))