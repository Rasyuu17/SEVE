export const config = {
    basePath: process.env.STORAGE_PATH || 'C:/repo',
    limits: {
        fileSize: 50 * 1024 * 1024,
        files: 1
    },
    port: process.env.PORT || 3001,
}