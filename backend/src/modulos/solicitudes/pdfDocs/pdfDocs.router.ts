import { Router } from 'express';

import { upload } from '../../../helpers/pdfUpload.middleware';
import { validateQuery } from '../../../helpers/validation.middleware';
import { container } from '../../../helpers/services.container';
import { PdfController } from './pdfDocs.controller';
import { documentoFilterSchema } from './pdfDocs.schemas';
import './pdfDocs.controller';

export const pdfDocsRouter = Router();
const controller = container.get<PdfController>('PdfController');

pdfDocsRouter.get('/', validateQuery(documentoFilterSchema), controller.buscarDocumento);
pdfDocsRouter.get('/:id/descargar', controller.descargarDocumento);
pdfDocsRouter.post('/:id/firmar', upload.single('file'), controller.subirFirmado);
pdfDocsRouter.put('/:documentoId/sala/confirmar', controller.confirmarDocumentoSala);