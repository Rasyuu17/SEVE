import express from 'express'
import cors from 'cors'
import uploadRoutes from './routes/upload.routes'
import { config } from './config'

const app = express()

app.use(cors())
app.use(uploadRoutes)

app.listen(config.port, () => {
    console.log(`🚀 Uploader corriendo en http://localhost:${config.port}`)
    console.log(`📁 Archivos en: ${config.basePath}`)
})