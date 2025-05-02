# Prediction interface for Cog ⚙️
# https://cog.run/python

from cog import BasePredictor, Input, Path
import model

class Predictor(BasePredictor):
    def setup(self) -> None:
        """Load the model into memory to make running multiple predictions efficient"""
        # self.model = torch.load("./weights.pth")
        self.device = model.get_device()
        args = model.get_args()
        self.model, self.tokenizer = model.load_model(args)

    def predict(
        self,
        knob_turns: str = Input(description="How much each neuron's knob was turned"), # CHANGE INTPUT AND OUTPUT TYPE
    ) -> dict:
        """Run a single prediction on the model"""
        # Run inference with the given neurons tweaked by the knob amount
        input_strings = []
        neuron_list_to_steer = []

        token_id = 3
        prediction = model.steer_token_activations_logits(self.model, self.tokenizer, input_strings, neuron_list_to_steer, token_id, self.device)
    
        return {"prediction": prediction}
