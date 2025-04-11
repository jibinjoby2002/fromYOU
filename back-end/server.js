const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Add this for CORS support

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json({ limit: '10mb' })); // For base64 image data
app.use(express.static(path.join(__dirname, '..', 'front-end')));

// Create uploads directory if needed
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'front-end', 'index.html'));
});

app.get('/test', (req, res) => {
  res.send('Server is working!');
});

// Modified upload endpoint for base64 images
app.post('/upload', (req, res) => {
  try {
    console.log('Upload request received'); // Debug log
    
    if (!req.body || !req.body.image) {
      return res.status(400).json({ error: 'No image data received' });
    }

    // Check if it's base64 image data
    if (typeof req.body.image !== 'string' || !req.body.image.startsWith('data:image')) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    // Extract base64 data
    const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Validate image size
    if (buffer.length < 1024) {
      return res.status(400).json({ error: 'Image data too small' });
    }

    const filename = `capture_${Date.now()}.jpg`;
    const filepath = path.join(uploadDir, filename);

    fs.writeFile(filepath, buffer, (err) => {
      if (err) {
        console.error('Save error:', err);
        return res.status(500).json({ error: 'Failed to save image' });
      }
      console.log(`Image saved: ${filename}`);
      res.json({ 
        success: true,
        filename: filename,
        size: buffer.length
      });
    });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Upload directory: ${uploadDir}`);
});