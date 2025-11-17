import multer from 'multer';

// Lưu trữ file vào thư mục "uploads/avatars"
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Đặt tên file theo thời gian
    },
});

// Chỉ cho phép upload ảnh có định dạng .jpg, .png, .jpeg
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

export const uploadAvatar = multer({ storage, fileFilter });
