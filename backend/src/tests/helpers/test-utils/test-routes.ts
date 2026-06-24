import { Router } from 'express';
import sequelize from '../../../config/database';
import { initTasa } from '../../../helpers/initTasa';
import { SolicitudSalaService } from '../../../modulos/solicitudes/solicitudesSala/solicitudSala.service';
import { PdfDocService } from '../../../modulos/solicitudes/pdfDocs/pdfDocs.service';

const router = Router();

if (process.env.NODE_ENV === 'test') {
    router.post('/reset', async (req, res) => {
        try {
            await sequelize.sync({ force: true });
            await initTasa();
            res.json({ success: true, message: 'BD reiniciada' });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    router.post('/solicitud-expirada', async (req, res) => {
        const transaction = await sequelize.transaction();
        const {Id} = req.body
        try {
            // Forzar createdAt a 3 días atrás
            await sequelize.query(
                `UPDATE documento SET "createdAt" = NOW() - INTERVAL '3 days' WHERE id = ${Id}`
            );

        const { container } = await import('../../../helpers/services.container');
        await import('../../../modulos/solicitudes/solicitudesSala/solicitudSala.controller');
        const salaService = container.get<SolicitudSalaService>('SolicitudSalaService');
        const docService = container.get<PdfDocService>('PdfDocService');
        
        const docsId = await docService.obtenerIdDocumentosVencidos(transaction)
        const anuladas = await salaService.anularSolicitudesExpiradas(docsId, transaction);

        transaction.commit();

            res.json({ success: true, anuladas });
        } catch (error: any) {
            transaction.rollback();
            res.status(500).json({ error: error.message });
        }
    });
}

export default router;