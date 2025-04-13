const express = require('express');
const path = require('path');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const app = express();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: 'dwna8uxzw',
  api_key: '847494121915246',
  api_secret: 'Ubmg2oeADDZP5jja10rKUXWIlp8'
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..', 'front-end')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'front-end', 'index.html'));
});

// Cloudinary upload endpoint
app.post('/upload', async (req, res) => {
  try {
    console.log('Upload request received');

    if (!req.body || !req.body.image) {
      return res.status(400).json({ error: 'No image data received' });
    }

    if (typeof req.body.image !== 'string' || !req.body.image.startsWith('data:image')) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: 'camera_uploads',
      resource_type: 'image'
    });

    console.log('Image uploaded to Cloudinary:', result.secure_url);
    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });

  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ 
      error: 'Upload failed',
      details: err.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});