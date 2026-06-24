import { Request, Response, NextFunction } from 'express'
import multer from 'multer'

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    console.error(`[ERROR] ${err.message}`, err.stack)
    
    // Errores de Multer
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                success: false,
                error: 'Archivo demasiado grande. Máximo 50MB'
            })
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Solo se permite un archivo por petición'
            })
        }
        
        return res.status(400).json({
            success: false,
            error: `Error de subida: ${err.message}`
        })
    }
    
    // Errores propios
    res.status(400).json({
        success: false,
        error: err.message
    })
}