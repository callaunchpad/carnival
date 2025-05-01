# Prediction interface for Cog ⚙️
# https://cog.run/python

from cog import BasePredictor, Input
from typing import Tuple
import torch
import torchvision


class Predictor(BasePredictor):
    def setup(self) -> None:
        """Load the model into memory to make running multiple predictions efficient"""
        self.model = torch.load("MNIST_model.pth", map_location=torch.device("cpu"))
        self.model.eval()
        self.img_path = 'api/three.png'
        self.img = torchvision.io.read_image(self.img_path)

    def predict(
        self,
        drawn_coords: str = Input(description="List of drawn coordinates, e.g., '(1,2), (3,4)'"),
    ) -> dict:
        """Run a single prediction on the model"""

        # Clone image to avoid modifying original
        edited = self.img.clone()
        min_val = torch.min(edited)

        try:
            coords = drawn_coords.replace("(", "").replace(")", "").split(",")
            coords = [int(c.strip()) for c in coords if c.strip().isdigit()]
            coord_pairs = list(zip(coords[::2], coords[1::2]))
        except Exception as e:
            return {"prediction": None}

        for x, y in coord_pairs:
            if 0 <= y < edited.shape[1] and 0 <= x < edited.shape[2]:
                edited[:, y, x] = min_val

        input_tensor = edited.unsqueeze(0).float() / 255.0

        with torch.no_grad():
            output = self.model(input_tensor)
            predicted_class = torch.argmax(output, dim=1).item()

        return {"prediction": predicted_class}
