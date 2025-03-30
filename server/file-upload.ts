import express, { Express, Request, Response, NextFunction } from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure express-fileupload middleware
export function setupFileUpload(app: Express) {
  app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: path.join(UPLOAD_DIR, 'temp'),
    createParentPath: true,
  }));

  // Route for file uploads
  app.post('/api/upload-resume', (req: Request, res: Response) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }

    const resumeFile = req.files.resume as fileUpload.UploadedFile;
    
    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(resumeFile.name);
    const filename = `resume_${timestamp}${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    // Move file to uploads directory
    resumeFile.mv(filePath, (err) => {
      if (err) {
        console.error('File upload error:', err);
        return res.status(500).json({ error: 'Error uploading file', details: err.message });
      }

      // Return the filepath that can be stored in the database
      const relativePath = path.join('/uploads', filename);
      return res.status(200).json({ 
        path: relativePath,
        filename: resumeFile.name,
        size: resumeFile.size
      });
    });
  });

  // Serve uploaded files
  app.use('/uploads', (req: Request, res: Response, next: NextFunction) => {
    // Add cache control headers
    res.setHeader('Cache-Control', 'public, max-age=86400');
    next();
  }, express.static(UPLOAD_DIR));
}