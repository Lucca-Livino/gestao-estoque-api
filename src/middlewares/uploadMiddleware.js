// src/middlewares/uploadMiddleware.js

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Diretório onde as fotos de perfil serão salvas
const uploadDir = 'public/uploads/fotos_perfil';

// Garante que o diretório de upload exista
fs.mkdirSync(uploadDir, { recursive: true });

// Configuração de armazenamento do Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Usa a matrícula do usuário para criar um nome de arquivo único
        const { matricula } = req.params;
        const fileExtension = path.extname(file.originalname);
        const uniqueSuffix = Date.now();
        const newFileName = `${matricula}-${uniqueSuffix}${fileExtension}`;
        cb(null, newFileName);
    }
});

// Filtro para aceitar apenas arquivos de imagem
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Formato de arquivo não suportado! Apenas imagens são permitidas.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5MB
    }
});

export default upload;