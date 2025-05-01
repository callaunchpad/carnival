# Prediction interface for Cog ⚙️
# https://cog.run/python

from cog import BasePredictor, Input, Path
from typing import List
from transformer_lens import HookedTransformer
from sae_lens import SAE
import torch

# Choose a layer you want to focus on
# For this tutorial, we're going to use layer 2


class Predictor(BasePredictor):
    def setup(self) -> None:
        """Load the model into memory to make running multiple predictions efficient"""
        self.device = "cuda"
        self.layer = 6
        self.model = HookedTransformer.from_pretrained("gemma-2-2b", device=self.device)
        self.sae, self.cfg_dict, _ = SAE.from_pretrained(
            release="gemma-2-2b-res-matryoshka-dc", sae_id=f"blocks.{self.layer}.hook_resid_post", device=self.device
        )
        # get hook point
        self.hook_point = self.sae.cfg.hook_name

    def predict(
        self,
        guess: str = Input(description="The word the player guessed"),
    ) -> dict:
        """Run a single prediction on the model"""
        # Do inference up to hook point

        # Project the layer output vector into 2D
        coords = [1, 2]

        return {"coords": coords}

