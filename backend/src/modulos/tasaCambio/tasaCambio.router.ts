import { Router } from 'express';

import { container } from '../../helpers/services.container';
import { validate } from '../../helpers/validation.middleware';
import { TasaCambioController } from './tasaCambio.controller';
import { tasaCambioSchema } from './tasaCambio.validator';
import { tarifasSchema } from './tasaCambio.schema';
import './tasaCambio.controller';

const controller = container.get<TasaCambioController>('TasaCambioController');

export const tasaRouter = Router();

/*tasaRouter.post('/', validate(tasaCambioSchema), controller.crearTasa);*/
tasaRouter.post('/tarifas', validate(tarifasSchema), controller.aplicarCambiosTarifas)
tasaRouter.get('/activa', controller.obtenerUltimaTasa);
tasaRouter.get('/:id', controller.obtenerPorId);
/*tasaRouter.get('/historico', controller.obtenerHistorico);*/
