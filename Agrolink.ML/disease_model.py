import torch
from torchvision import transforms
from transformers import AutoModelForImageClassification

MODEL_NAME = "mesabo/agri-plant-disease-resnet50"

device = torch.device("cpu")

# Manual preprocessing since model lacks processor config
processor = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

model = AutoModelForImageClassification.from_pretrained(MODEL_NAME)
model.to(device)
model.eval()


def clean_label(label: str):
    return label.replace("___", " - ").replace("_", " ")