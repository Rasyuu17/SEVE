import { Router } from 'express';

import { container } from '../../../helpers/services.container';
import { validate } from '../../../helpers/validation.middleware';
import { SolicitudSalaController } from './solicitudSala.controller';
import { creationSolicitudSchema, validationSchema } from './solicitudSala.schemas';
import './solicitudSala.controller';

const controller = container.get<SolicitudSalaController>('SolicitudSalaController');

export const solicitudSalaRouter = Router();

solicitudSalaRouter.post('/', validate(creationSolicitudSchema), controller.crear);
solicitudSalaRouter.post('/disponibilidad', validate(validationSchema), controller.validar);
solicitudSalaRouter.get('/documento/:documentoId', controller.obtenerPorDocumento);
solicitudSalaRouter.put('/documento/:documentoId/cancelar', controller.cancelarPorDocumento);
solicitudSalaRouter.get('/calendario-operativo/:month/:year', controller.obtenerCalendarioOperativo);
solicitudSalaRouter.get('/:name/:month/:year', controller.obtenerCalendario);
solicitudSalaRouter.get('/:id', controller.obtener);
solicitudSalaRouter.put('/:id/cancelar', controller.cancelar);