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

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
