# Prediction interface for Cog ⚙️
# https://cog.run/python

from cog import BasePredictor, Input, Path
from typing import List
from transformer_lens import HookedTransformer
import torch
from transformers import AutoTokenizer
import os

class Predictor(BasePredictor):
    def setup(self) -> None:
        """Load the model into memory to make running multiple predictions efficient"""
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.layer = 12
        self.model_name = "gemma-2-2b"

        self.model = HookedTransformer.from_pretrained(self.model_name, device=self.device,)
        # get hook point
        self.hook_point = f"blocks.{self.layer}.hook_resid_post"
        self.tokenizer = AutoTokenizer("google/gemma-2-2b")

    def predict(
        self,
        guess: str = Input(description="The word the player guessed"),
    ) -> dict:
        """Run a single prediction on the model"""
        # Tokenize the guess
        tokens = self.tokenizer(guess, return_tensors="pt").to("cuda")

        # Do inference with cache
        logits, cache = self.model.run_with_cache(tokens)

        # Access the activations at the exact hook point your SAE was trained on
        print(f"cache: {cache}")
        layer_12_activations = cache[self.hook_point][0, -1, :]
        print(f"layer 12 activations: {layer_12_activations}")

        # Project the layer output vector into 2D
        coords = [1, 2]

        return {"coords": coords}

