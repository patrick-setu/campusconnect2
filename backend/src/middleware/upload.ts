import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const notesDir = path.join(uploadDir, 'notes');
const clubEventsDir = path.join(uploadDir, 'club-events');

if (!fs.existsSync(notesDir)) {
  fs.mkdirSync(notesDir, { recursive: true });
}
if (!fs.existsSync(clubEventsDir)) {
  fs.mkdirSync(clubEventsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, notesDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,ppt,pptx,txt,md').split(',');
  const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`));
  }
};

export const uploadNote = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
});

// storage for club event media 
const clubMediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, clubEventsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// basic filter for common media extensions
const clubMediaFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = (process.env.ALLOWED_CLUB_MEDIA || 'jpg,jpeg,png,gif,webp,mp4,mov,webm').split(',');
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error(`File type .${ext} is not allowed. Allowed: ${allowed.join(', ')}`));
};

export const uploadClubMedia = multer({
  storage: clubMediaStorage,
  fileFilter: clubMediaFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_MEDIA_FILE_SIZE || '104857600'), // cap at ~100MB per file
  },
});
