# Prediction interface for Cog ⚙️
# https://cog.run/python

from cog import BasePredictor, Input, Path

class Predictor(BasePredictor):
    def setup(self) -> None:
        """Load the model into memory to make running multiple predictions efficient"""
        # self.model = torch.load("./weights.pth")

    def predict(
        self,
        knob_turns: str = Input(description="How much each neuron's knob was turned"), # CHANGE INTPUT AND OUTPUT TYPE
    ) -> dict:
        """Run a single prediction on the model"""
        # Run inference with the given neurons tweaked by the knob amount
    
        # Return the resulting prediction
        prediction = "lebron"
    
        return {"prediction": prediction}
