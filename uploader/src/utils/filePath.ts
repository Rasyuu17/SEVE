import path from 'path'
import fs from 'fs'
import { config } from '../config'

export function sanitizeFolderName(name: string | number): string {
    return String(name).replace(/[^a-zA-Z0-9_-]/g, '')
}

export function moveFileToContractFolder(
    tempPath: string,
    filename: string,
    idContratoGeneral: string | number,
    idContratoEspecifico: string | number
): string {
    const general = sanitizeFolderName(idContratoGeneral)
    const especifico = sanitizeFolderName(idContratoEspecifico)
    
    const finalDir = path.join(config.basePath, general, especifico)
    fs.mkdirSync(finalDir, { recursive: true })
    
    const finalPath = path.join(finalDir, filename)
    fs.renameSync(tempPath, finalPath)
    
    return finalPath
}

export function getRelativePath(fullPath: string): string {
    return path.relative(config.basePath, fullPath).replace(/\\/g, '/')
}