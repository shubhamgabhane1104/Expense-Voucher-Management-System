const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads', 'signatures');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `sig-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|svg/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const mime = file.mimetype;

    if (allowedTypes.test(ext) || mime.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, PNG, WEBP, SVG) are allowed'));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter
});

// Helper to save base64 signature if canvas drawing is used
const saveBase64Signature = (dataString) => {
    if (!dataString) return null;
    if (dataString.startsWith('/uploads/')) return dataString; // already a path

    const matches = dataString.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        return null;
    }

    const ext = matches[1].replace('svg+xml', 'svg');
    const base64Data = matches[2];
    const filename = `sig-canvas-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext === 'jpeg' ? 'jpg' : ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    return `/uploads/signatures/${filename}`;
};

module.exports = {
    upload,
    saveBase64Signature
};
