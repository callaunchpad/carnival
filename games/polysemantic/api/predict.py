# Prediction interface for Cog ⚙️
# https://cog.run/python

from cog import BasePredictor, Input, Path
from typing import List
from transformer_lens import HookedTransformer
import torch
from transformers import AutoTokenizer
from dotenv import load_dotenv

load_dotenv()

class Predictor(BasePredictor):
    def setup(self) -> None:
        """Load the model into memory to make running multiple predictions efficient"""
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.layer = 12

        self.model = HookedTransformer.from_pretrained("gemma-2-2b", device=self.device)
        # get hook point
        self.hook_point = f"blocks.{self.layer}.hook_resid_post"
        self.tokenizer = AutoTokenizer.from_pretrained("google/gemma-2-2b")

    def predict(
        self,
        guess: str = Input(description="The word the player guessed"),
    ) -> dict:
        """Run a single prediction on the model"""
        # Tokenize the guess
        prompt = f"Repeat exactly: {guess}"

        tokens = self.tokenizer(guess, return_tensors="pt").to(self.device)
        input_ids = tokens["input_ids"]

        # Do inference with cache
        logits, cache = self.model.run_with_cache(input_ids)

        # Access the layer activations
        layer_12_activations = cache[self.hook_point][0, -1, :]

        # Project the layer output vector into 2D
        coords = [1, 2]

        return {"activations": layer_12_activations.tolist()}

