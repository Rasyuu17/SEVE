import { Router } from 'express';

import { container } from '../../../../helpers/services.container';
import { validate } from '../../../../helpers/validation.middleware';
import { SalaController } from './sala.controller';
import { salaSchema } from './sala.validator';
import './sala.controller';

const controller = container.get<SalaController>('SalaController');

export const salaRouter = Router();

salaRouter.get('/disponibles', controller.obtenerDisponibles);
salaRouter.post('/', validate(salaSchema), controller.crear);
salaRouter.get('/', controller.listar);
salaRouter.get('/:id/planes', controller.obtenerSalasPorPlan);
salaRouter.get('/:id', controller.obtenerPorId);
salaRouter.put('/:id', validate(salaSchema), controller.modificar);
salaRouter.delete('/:id', controller.eliminar);