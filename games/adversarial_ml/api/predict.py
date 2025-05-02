# Prediction interface for Cog ⚙️
# https://cog.run/python

from cog import BasePredictor, Input
import torch
import torch.nn as nn

class MLP(nn.Module):
  def __init__(self):
    super().__init__()
    self.flatten = nn.Flatten()
    self.linear_relu_stack = nn.Sequential(
        nn.Linear(28*28, 512),
        nn.ReLU(),
        nn.Linear(512, 512),
        nn.ReLU(),
        nn.Linear(512, 10)
    )

  def forward(self, x):
    x = self.flatten(x)
    logits = self.linear_relu_stack(x)
    return logits

class Predictor(BasePredictor):
    def setup(self) -> None:
        """Load the model into memory to make running multiple predictions efficient"""
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = MLP()
        self.model.load_state_dict(torch.load('misc/CPU_WEIGHTS.pth'))
        self.model = self.model.to(self.device)
        self.model.eval()

        self.img = torch.load('misc/three.pt').to(self.device)
        self.label = 3

    def predict(
        self,
        drawn_coords: list[int] = Input(description="List of drawn coordinates, e.g., [1, 2, 3, 4] for [1,2] and [3,4]"),
    ) -> dict:
        """Run a single prediction on the model"""

        # Clone image to avoid modifying original
        edited = self.img.clone()
        max_val = torch.max(edited)

        # Example of drawn_coords: "1,2|3,4"
        for i in range(0, len(drawn_coords), 2):
            x, y = drawn_coords[i], drawn_coords[i+1]
            edited[x, y] = max_val

        edited = edited.reshape(1, -1)

        with torch.no_grad():
            output = self.model(edited)
            predicted_class = torch.argmax(output, dim=1).item()

        return {"prediction": predicted_class}
