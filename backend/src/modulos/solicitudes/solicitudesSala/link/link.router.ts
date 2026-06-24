import { Router } from 'express';

import { container } from '../../../../helpers/services.container';
import { LinkController } from './link.controller';
import './link.controller';

const controller = container.get<LinkController>('LinkController');

export const linkRouter = Router();

linkRouter.get('/:link', controller.validarLink);