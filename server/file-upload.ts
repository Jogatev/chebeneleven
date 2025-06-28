import express, { type Express } from "express";
import fileUpload from "express-fileupload";
import path from "path";
import fs from "fs";

export function setupFileUpload(app: Express) {
  const uploadsDir = path.join(process.cwd(), "uploads");
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 },
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: path.join(uploadsDir, "temp"),
  }));

  app.post("/api/upload-resume", (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No files were uploaded." });
    }

    const uploadedFile = req.files.resume as fileUpload.UploadedFile;
    const fileName = `${uploadedFile.name}_${Date.now()}${path.extname(uploadedFile.name)}`;
    const filePath = path.join(uploadsDir, fileName);

    uploadedFile.mv(filePath, (err) => {
      if (err) {
        console.error("File upload error:", err);
        return res.status(500).json({ error: "Failed to upload file" });
      }

      res.json({ 
        success: true, 
        filePath: `/uploads/${fileName}`,
        fileName: fileName 
      });
    });
  });

  app.use("/uploads", express.static(uploadsDir));
}