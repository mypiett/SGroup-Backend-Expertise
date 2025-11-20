import multer, { FileFilterCallback } from 'multer';
import type { Request } from 'express';

function fileFilter(
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) {
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed') as any, false);
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
