import multer from 'multer';
import path from 'path';

// Cấu hình nơi lưu file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars'); // thư mục lưu avatar
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${file.fieldname}${ext}`);
    },
});

// Bộ lọc file (chỉ cho phép ảnh)
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

export const uploadAvatar = multer({ storage, fileFilter });
