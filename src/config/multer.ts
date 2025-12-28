import multer, { FileFilterCallback } from 'multer';
import type { Request } from 'express';

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(
      new Error('Only JPG, PNG or WEBP image files are allowed') as any,
      false
    );
  }
  cb(null, true);
}

const storage = multer.memoryStorage();

export const avatarUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const boardCoverUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const attachmentUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});
