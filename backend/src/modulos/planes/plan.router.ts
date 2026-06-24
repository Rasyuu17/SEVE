import { Router } from 'express';

import { container } from '../../helpers/services.container';
import { PlanController } from './plan.controller';
import './plan.controller';

const controller = container.get<PlanController>('PlanController');

export const planRouter = Router();

planRouter.post('/', controller.crear);
planRouter.get('/', controller.listar);
planRouter.get('/:tipo/:id', controller.obtenerPorId);
planRouter.put('/:tipo/:id', controller.modificar);
planRouter.delete('/:tipo/:id', controller.eliminar);