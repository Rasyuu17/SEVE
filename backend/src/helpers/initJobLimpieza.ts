// src/helpers/initAnulacionJob.ts
import { SolicitudSalaService } from '../modulos/solicitudes/solicitudesSala/solicitudSala.service';
import { container } from './services.container';
import sequelize from '../config/database';
import { PdfDocService } from '../modulos/solicitudes/pdfDocs/pdfDocs.service';

export const initJobLimpieza = () => {
    const service = container.get<SolicitudSalaService>('SolicitudSalaService');
    const docService = container.get<PdfDocService>('PdfDocService')

    const ejecutar = async () => {
        const transaction = await sequelize.transaction()
        try {
            const docsId = await docService.obtenerIdDocumentosVencidos(transaction)
            const anuladas = await service.anularSolicitudesExpiradas(docsId,transaction);
            transaction.commit();
            if (anuladas > 0) {
                console.log(`[ANULACIÓN] ${anuladas} solicitudes pendientes anuladas por expiración`);
            }
        } catch (error) {
            transaction.rollback();
            console.error('[ANULACIÓN] Error:', error);
        }
    };

    ejecutar();

    // Cada 2 horas
    setInterval(ejecutar, 7200000);
};