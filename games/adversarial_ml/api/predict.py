# Prediction interface for Cog ⚙️
# https://cog.run/python

from cog import BasePredictor, Input, Path
from typing import List
import torch


class Predictor(BasePredictor):
    def setup(self) -> None:
        """Load the model into memory to make running multiple predictions efficient"""
        self.model = torch.load("MNIST_model.pth", map_location=torch.device("cpu"))

    def predict(
        self,
        drawn_coords: str = Input(description="List of drawn coordinates"),
    ) -> dict:
        """Run a single prediction on the model"""
        # processed_input = preprocess(image)
        # output = self.model(processed_image, scale)
        # return postprocess(output)

        # Preprocess image (put drawn coords onto it) ~ use min(image) as the value for a "drawn" coord

        # Do inference
        prediction = True

        return {"prediction": prediction}

