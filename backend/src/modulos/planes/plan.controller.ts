import { Request, Response } from 'express';

import { Injectable } from '../../helpers/decorators/injectable.decorator';
import { PlanService } from './plan.service';
import { TasaCambioService } from '../tasaCambio/tasaCambio.service';
import { ZodError } from 'zod';

@Injectable(['PlanService', 'TasaCambioService'])
export class PlanController {
  constructor(private planService: PlanService, private tasaService: TasaCambioService) {}

  crear = async (req: Request, res: Response) => {
    try {
      const { tipo, ...data } = req.body;
      if(!tipo){
        res.status(400).json({error: 'Tipo de plan requerido'})
      }
      const tasa_cambio = await this.tasaService.obtenerTasaActiva();
      if (tasa_cambio) {
        const plan = await this.planService.crearPlan(tipo, tasa_cambio.id, data);
        res.status(201).json(plan);
      } else {
        res.status(500).json({ error: 'No existe tasa de cambio para crear el plan' });
      }
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: error.issues.map(issue=>issue.message).join(' + ') });
      }
      
      if (error.message?.includes('ya existe')) {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  listar = async (req: Request, res: Response) => {
    try {
      const { tipo } = req.query;
      if (!tipo?.toString().trim() || Array.isArray(tipo)) {
        res.status(400).json({error: 'Tipo de plan requerido'} );
      }
      const planes = await this.planService.obtenerTodos(tipo as string);
      res.status(200).json(planes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  obtenerPorId = async (req: Request, res: Response) => {
    try {
      const { tipo, id } = req.params;
      if (!tipo.toString().trim() || !id.toString().trim()|| Array.isArray(tipo) || Array.isArray(id)) {
        res.status(400).json({error: 'Tipo e ID son requeridos'});
      }
      const plan = await this.planService.obtenerPlan(tipo.toString(), parseInt(id.toString()));
      res.status(200).json(plan);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  modificar = async (req: Request, res: Response) => {
    try {
      const { tipo, id } = req.params;
      const tasa_cambio = await this.tasaService.obtenerTasaActiva();
      if (!tipo.toString().trim() || !id.toString().trim()|| Array.isArray(tipo) || Array.isArray(id)) {
        res.status(400).json({error: 'Tipo e ID son requeridos'});
      }
      if (tasa_cambio) {
        const plan = await this.planService.modificarPlan(tipo.toString(), parseInt(id.toString()),tasa_cambio?.id, req.body);
        res.status(200).json(plan);
      } else {
        res.status(500).json({ error: 'No existe tasa de cambio para modificar el plan' });
      }
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: error.issues.map(issue=>issue.message).join(' + ') });
      }
      res.status(500).json({ error: error.message });
    }
  };

  eliminar = async (req: Request, res: Response) => {
    try {
      const { tipo, id } = req.params;
      if (!tipo.toString().trim() || !id.toString().trim() || Array.isArray(tipo) || Array.isArray(id)) {
        res.status(400).json({error: 'Tipo e ID son requeridos'});
      }
      const plan = await this.planService.eliminarPlan(tipo.toString(), parseInt(id.toString()));
      res.status(200).json(plan);
    } catch (error: any) {
      if (error.message?.includes('no encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };
}