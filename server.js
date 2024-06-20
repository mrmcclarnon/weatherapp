const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static('public'));

// Endpoint to get the API key
app.get('/api-key', (req, res) => {
  const apiKey = process.env.API_KEY;
  if (apiKey) {
    res.json({ apiKey });
  } else {
    res.status(500).json({ error: 'API key not found' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

