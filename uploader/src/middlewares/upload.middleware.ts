import multer from 'multer'
import path from 'path'
import { config } from '../config'
import fs from 'fs'

function formatearFecha(): string {
    const ahora = new Date()
    const año = ahora.getFullYear()
    const mes = String(ahora.getMonth() + 1).padStart(2, '0')
    const dia = String(ahora.getDate()).padStart(2, '0')
    
    return `${año}${mes}${dia}`
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Guardar temporalmente en una carpeta base
        // Luego movemos a la carpeta correcta
        fs.mkdirSync(config.basePath, { recursive: true })
        cb(null, config.basePath)
    },
    filename: (req, file, cb) => {
        const safeName = `${formatearFecha()}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        cb(null, safeName)
    }
})

const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true)
    } else {
        cb(new Error(`Solo se permiten PDF. Recibido: ${file.mimetype}`))
    }
}

export const upload = multer({
    storage,
    limits: config.limits,
    fileFilter,
})