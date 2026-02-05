import joblib
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# --------------------
# Load models once
# --------------------
crop_model = joblib.load(BASE_DIR / "models/agrolink_crop_model.pkl")
fert_model = joblib.load(BASE_DIR / "models/agrolink_fertilizer_model.pkl")
fert_features = joblib.load(BASE_DIR / "models/agrolink_fertilizer_features.pkl")


def predict_crop(features: list[float]) -> int:
    X = np.array(features).reshape(1, -1)
    pred = crop_model.predict(X)[0]
    return int(pred)


def predict_fertilizer(features: list[float], crop_id: int) -> int:
    """
    features = [N,P,K,temp,humidity,ph,rainfall]
    crop_id = predicted crop index
    """

    # base soil/weather features
    row = {
        "N": features[0],
        "P": features[1],
        "K": features[2],
        "temperature": features[3],
        "humidity": features[4],
        "ph": features[5],
        "rainfall": features[6],
    }

    # zero all crop one-hot
    for col in fert_features:
        if col.startswith("crop_"):
            row[col] = 0

    # turn ON predicted crop column
    crop_col = f"crop_{crop_id}"
    if crop_col in row:
        row[crop_col] = 1

    # build final X in correct order
    X = np.array([[row[c] for c in fert_features]])

    pred = fert_model.predict(X)[0]
    return int(pred)
