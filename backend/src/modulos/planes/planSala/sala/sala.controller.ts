import { Request, Response } from 'express';

import { Injectable } from '../../../../helpers/decorators/injectable.decorator';
import { SalaService } from './sala.service';

@Injectable(['SalaService'])
export class SalaController {
  constructor(private service: SalaService) {}

  crear = async (req: Request, res: Response) => {
    try {
      const sala = await this.service.crear(req.body);
      res.status(201).json(sala);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  listar = async (req: Request, res: Response) => {
    try {
      const salas = await this.service.obtenerTodas();
      res.status(200).json(salas);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  obtenerPorId = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const sala = await this.service.obtenerPorId(parseInt(id.toString()));
      return sala
        ? res.status(200).json(sala)
        : res.status(404).json({ message: 'No se encontró la sala' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  obtenerDisponibles = async (req: Request, res: Response) => {
    try {
      const salas = await this.service.obtenerDisponibles();
      res.status(200).json(salas);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  obtenerSalasPorPlan = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const salas = await this.service.obtenerSalasPorPlan(parseInt(id.toString()));
      res.status(200).json(salas);
    } catch (error: any) {
      if (error.message === 'Plan no encontrado') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  };

  modificar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const sala = await this.service.modificar(parseInt(id.toString()), req.body);
      res.status(200).json(sala);
    } catch (error: any) {
      if (error.message === 'Sala no encontrada') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'No se puede modificar o eliminar la sala porque está asociada a un plan activo') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  };

  eliminar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.service.eliminar(parseInt(id.toString()));
      res.status(200).json({ message: 'Sala eliminada correctamente' });
    } catch (error: any) {
      if (error.message === 'Sala no encontrada') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'No se puede modificar o eliminar la sala porque está asociada a un plan activo') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  };
}