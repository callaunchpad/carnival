# Prediction interface for Cog ⚙️
# https://cog.run/python

from cog import BasePredictor, Input, Path
from typing import List
from transformer_lens import HookedTransformer
from sae_lens import SAE
import torch
from transformers import AutoTokenizer
from dotenv import load_dotenv
import pickle

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

        # Get SAE
        self.sae, cfg_dict, _ = SAE.from_pretrained(
        release="gemma-2-2b-res-matryoshka-dc", sae_id=f"blocks.{self.layer}.hook_resid_post")
        self.sae = self.sae.to(self.device)

        # Feature index
        self.feature_index = 1644 # water feature

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

        sae_activations = self.sae.encode(layer_12_activations)
        feature_activation = sae_activations[self.feature_index]
        
        pre_pca_activations = layer_12_activations.reshape(1, -1).detach().cpu()
        
        # Project the layer output vector into 2D
        projection = self.pca.transform(pre_pca_activations)[0].tolist()
        feature_activation = feature_activation.tolist()

        return {"projection": projection, "feature_activation" : feature_activation}
