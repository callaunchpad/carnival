# Prediction interface for Cog ⚙️
# https://cog.run/python

from cog import BasePredictor, Input, Path
from typing import List
from transformer_lens import HookedTransformer
import torch
from transformers import AutoTokenizer
from dotenv import load_dotenv
import pickle

load_dotenv() # Do we need this? Can't set env variable on replicate side.

class Predictor(BasePredictor):
    def setup(self) -> None:
        """Load the model into memory to make running multiple predictions efficient"""
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.layer = 12
        self.model = HookedTransformer.from_pretrained("gemma-2-2b", device=self.device)

        # get hook point
        self.hook_point = f"blocks.{self.layer}.hook_resid_post"
        self.tokenizer = AutoTokenizer.from_pretrained("google/gemma-2-2b")

        # load pca
        with open('pca_model.pkl', 'rb') as f:
            self.pca = pickle.load(f)

    def predict(
        self,
        guess: str = Input(description="The word the player guessed"),
    ) -> dict:
        """Run a single prediction on the model"""
        # Tokenize the guess
        prompt = f"Repeat exactly: {guess}"

        tokens = self.tokenizer(prompt, return_tensors="pt").to(self.device)
        input_ids = tokens["input_ids"]

        # Do inference with cache
        logits, cache = self.model.run_with_cache(input_ids)

        # Access the layer activations
        layer_12_activations = cache[self.hook_point][0, -1, :]

        # MIGHT NEED TO RESHAPE layer_12_activations

        # Project the layer output vector into 2D
        projection = self.pca.transform(layer_12_activations)[0].tolist()

        return {"activations": projection}

