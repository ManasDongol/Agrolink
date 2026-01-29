import joblib
import numpy as np

# Load trained artifacts
model = joblib.load("agrolink_model.pkl")


def predict_crop(features: list[float]) -> int:
    """
    features: list of numerical inputs (same order as training)
    returns: predicted class index
    """
    X = np.array(features).reshape(1, -1)
      # remove this line if no scaler
    prediction = model.predict(X)
    return int(prediction[0])
