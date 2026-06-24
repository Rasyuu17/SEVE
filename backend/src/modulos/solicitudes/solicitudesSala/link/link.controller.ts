import { Request, Response } from 'express';

import { Injectable } from '../../../../helpers/decorators/injectable.decorator';
import { LinkService } from './link.service';

@Injectable(['LinkService'])
export class LinkController {
  constructor(private service: LinkService) {}

  validarLink = async (req: Request, res: Response) => {
    try {
      const { link } = req.params;
      const valido = await this.service.obtenerLink(link.toString());

      if (valido) {
        res.status(200).json({ response: false, message: 'Ya existe un link similar' });
      } else {
        res.status(200).json({ response: true, message: 'Link disponible' });
      }
    } catch (error) {
      res.status(404).json({ error: error });
    }
  };
}