import pickle
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# --------------------
# Load pipeline once
# --------------------
with open(BASE_DIR / "pipeline.pkl", "rb") as f:
    pipeline = pickle.load(f)

model_crop = pipeline["model_crop"]
model_fert = pipeline["model_fert"]
le_crop = pipeline["le_crop"]
le_fert = pipeline["le_fert"]
yield_map = pipeline["yield_map"]


# --------------------
# Helper functions
# --------------------
def get_top3_crops(probs_row):
    results = []
    for i, prob in enumerate(probs_row):
        crop = le_crop.inverse_transform([i])[0]
        yield_score = yield_map.get(crop, 0)
        final_score = prob * yield_score

        results.append({
            "crop": crop,
            "crop_prob": float(round(prob, 3)),
            "yield": float(round(yield_score, 2)),
            "score": final_score,
            "crop_idx": i
        })

    return sorted(results, key=lambda x: x["score"], reverse=True)[:3]


def get_top3_fertilizers_for_crop(X_input, crop_idx, crop_prob):
    X_with_crop = np.append(X_input, crop_idx)

    fert_probs = model_fert.predict_proba([X_with_crop])[0]
    top3_idx = np.argsort(fert_probs)[::-1][:3]

    results = []
    for idx in top3_idx:
        fert = le_fert.inverse_transform([idx])[0]
        fert_prob = fert_probs[idx]

        results.append({
            "fertilizer": fert,
            "fert_prob": float(round(fert_prob, 3)),
            "score": float(round(crop_prob * fert_prob, 3))
        })

    return results


# --------------------
# Main prediction
# --------------------
def predict(features: list[float]):
    X_input = np.array(features)

    crop_probs = model_crop.predict_proba([X_input])[0]
    top3_crops = get_top3_crops(crop_probs)

    final_results = []

    for crop_item in top3_crops:
        ferts = get_top3_fertilizers_for_crop(
            X_input,
            crop_item["crop_idx"],
            crop_item["crop_prob"]
        )

        final_results.append({
            "crop": crop_item["crop"],
            "crop_prob": crop_item["crop_prob"],
            "yield": crop_item["yield"],
            "fertilizers": ferts
        })

    return final_results