// server/index.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const Replicate = require('replicate');

dotenv.config();

const app = express();
const port = 4167;

app.use(cors());
app.use(express.json());

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post('/api/predict', async (req, res) => {
  try {
    const { points } = req.body;

    console.log("Points:", points);

    const output = await replicate.run(
      "carnival/mnist:13e8796f49cc21ed91f8b3075584b62f230de87d21ac809729d1cc1e8a1f8893",
      {
        input: { "drawn_coords" : points }
      }
    );

    console.log("Replicate output:", output);

    res.json({ prediction: output });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Prediction failed.' });
  }
});

app.post('/coordinates', async (req, res) => {
    try {
      const { word } = req.body;
      
      console.log(`Received request for word: ${word}`);
  
      let output = await replicate.deployments.predictions.create(
        "carnival",
        "sp-25-lp-showcase",
        {
          input: {
            guess: word
          }
        }
      );
      output = await replicate.wait(output);
      console.log("Replicate output:", output);
  
      // Format the response to match what the frontend expects
      const response = {
        coordinates: [
          output.output.projection[0],
          output.output.projection[1]
        ],
        scalar: output.output.feature_activation
      };
  
      res.json(response);
    } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: 'Prediction failed.' });
    }
  });

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
