import { Router, Request, Response } from 'express'
import multer from 'multer'
import { upload } from '../middlewares/upload.middleware'
import { moveFileToContractFolder, getRelativePath } from '../utils/filePath'

const router = Router()

router.post('/upload', (req: Request, res: Response) => {
    upload.single('file')(req, res, (err: any) => { 
        console.log('Body:', req.body)
        console.log('File path:', req.file?.path)
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(413).json({ success: false, error: 'PDF no debe superar 50MB' })
                }
                return res.status(400).json({ success: false, error: err.message })
            }
            return res.status(400).json({ success: false, error: err.message })
        }


        const { idContratoGeneral, idContratoEspecifico } = req.body
        
        console.log('idContratoGeneral:', idContratoGeneral)
        console.log('idContratoEspecifico:', idContratoEspecifico)

        if (!idContratoGeneral || !idContratoEspecifico) {
            return res.status(400).json({ success: false, error: 'Faltan idContratoGeneral o idContratoEspecifico' })
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No se recibió archivo' })
        }

        try {
            // Mover archivo de la carpeta temporal a la estructura correcta
            const finalPath = moveFileToContractFolder(
                req.file.path,
                req.file.filename,
                idContratoGeneral,
                idContratoEspecifico
            )
            
            const relativePath = getRelativePath(finalPath)

            res.json({
                success: true,
                data: {
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    size: req.file.size,
                    url: `/repo/${relativePath}`,
                    idContratoGeneral,
                    idContratoEspecifico,
                    uploadedAt: new Date().toISOString()
                }
            })
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    })
})

router.get('/health', (req, res) => {
    res.json({ status: 'ok' })
})

export default router