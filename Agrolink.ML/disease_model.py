import torch
import json
from torchvision import transforms, models
from huggingface_hub import hf_hub_download

MODEL_REPO = "Saon110/bd-crop-vegetable-plant-disease-model"
NUM_CLASSES = 94

device = torch.device("cpu")

# Optimize CPU performance
torch.set_num_threads(4)

# Standard ResNet50 preprocessing
processor = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

print("[AgroLink] Loading disease model...")


model_path = hf_hub_download(
    repo_id=MODEL_REPO,
    filename="crop_veg_plant_disease_model.pth"
)
labels_path = hf_hub_download(
    repo_id=MODEL_REPO,
    filename="class_mapping.json"
)


model = models.resnet50(weights=None)
model.fc = torch.nn.Sequential(
    torch.nn.Linear(2048, 512),
    torch.nn.ReLU(),
    torch.nn.Dropout(0.3),
    torch.nn.Linear(512, NUM_CLASSES)
)

# Load the saved weights
state_dict = torch.load(model_path, map_location=device, weights_only=True)

# Unwrap nested state dicts
if isinstance(state_dict, dict) and "model_state_dict" in state_dict:
    state_dict = state_dict["model_state_dict"]
elif isinstance(state_dict, dict) and "state_dict" in state_dict:
    state_dict = state_dict["state_dict"]


state_dict = {
    k.replace("module.", "", 1): v
    for k, v in state_dict.items()
}

model.load_state_dict(state_dict)
model.to(device)
model.eval()

#
with open(labels_path, "r") as f:
    class_mapping = json.load(f)

print(f"[AgroLink] Model loaded. {len(class_mapping)} disease classes ready.")


def clean_label(label: str) -> str:
    """Convert raw label like 'Tomato___Late_blight' to 'Tomato - Late blight'"""
    return label.replace("___", " - ").replace("_", " ")