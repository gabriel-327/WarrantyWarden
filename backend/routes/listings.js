import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

import {
    createListing,
    getAll,
    getListing,
    deleteListing,
} from '../controllers/listingsController.js';

const router = express.Router();

router.use((req, res, next) => {
    console.log(req.path);
    next();
});

// checks validity of file path
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// multer for single file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, '_');
        cb(null, Date.now() + '_' + safeName);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const ok =
            file.mimetype.startsWith('image/') ||
            file.mimetype === 'application/pdf';
        cb(ok ? null : new Error('Only images or PDFs allowed'), ok);
    },
});


router.get('/', getAll);

router.get('/:id', getListing);

// now allows attachment uploads
router.post('/', upload.single('attachment'), createListing);

router.delete('/:id', deleteListing);

// update listing isn't of high priority
/*
router.patch('/:id', (req, res) => {
    res.send('patch listing');
})
*/

export default router;
