const app = require('./api/index');
const express = require('express');
const path = require('path');

// Port from environment or default to 3000
const PORT = process.env.PORT || 3000;

// Serve static files from the React frontend build (Vite defaults to 'dist')
app.use(express.static(path.join(__dirname, 'dist')));

// Any request that doesn't match an API route should serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Render Server is running on port ${PORT}`);
});
