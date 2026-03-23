import express from 'express';
import { upload } from '../middlewares/uploadMiddleware';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { bucket } from '../config/firebase';
import fs from 'fs';
import path from 'path';

const router = express.Router();

router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const filename = req.file.fieldname + '-' + uniqueSuffix + path.extname(req.file.originalname);

  if (bucket) {
    try {
      const fileUpload = bucket.file(`images/${filename}`);
      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      stream.on('error', (error) => {
        console.error('Firebase Storage Error:', error);
        res.status(500).json({ message: 'Error uploading to cloud storage' });
      });

      stream.on('finish', async () => {
        await fileUpload.makePublic();
        const imageUrl = `https://storage.googleapis.com/${bucket?.name}/${fileUpload.name}`;
        res.json({ imageUrl });
      });

      stream.end(req.file.buffer);
    } catch (error) {
       console.error(error);
       res.status(500).json({ message: 'Internal Server Error during upload' });
    }
  } else {
    // Fallback to local
    console.warn("Firebase Bucket not configured. Falling back to local storage.");
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    
    const localPath = path.join(uploadDir, filename);
    fs.writeFileSync(localPath, req.file.buffer);
    const imageUrl = `/uploads/${filename}`;
    res.json({ imageUrl });
  }
});

export default router;
