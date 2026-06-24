import { Request, Response } from 'express';

import { Injectable } from '../../helpers/decorators/injectable.decorator';
import sequelize from '../../config/database';
import { TasaCambioService } from './tasaCambio.service';
import { PlanService } from '../planes/plan.service';
import { SolicitudSalaService } from '../solicitudes/solicitudesSala/solicitudSala.service';
import { PdfDocService } from '../solicitudes/pdfDocs/pdfDocs.service';

@Injectable(['TasaCambioService', 'PlanService', 'SolicitudSalaService', 'PdfDocService'])
export class TasaCambioController {
  constructor(private service: TasaCambioService,
    private planService: PlanService,
    private solicitudService: SolicitudSalaService,
    private pdfDocService: PdfDocService) {}

/*  crearTasa = async (req: Request, res: Response) => {
    const transaction = await sequelize.transaction();

    try {
      const { tasa } = req.body;

      const nuevaTasa = await this.service.nuevaTasa(tasa, transaction);
      if (nuevaTasa.id) {
        await this.planService.versionarPlanesPorNuevaTasa(nuevaTasa.id, transaction);
      }
      await transaction.commit();
      res.status(201).json(nuevaTasa);
    } catch (error: any) {
      await transaction.rollback();
      res.status(500).json({ error: error.message });
    }
  };*/

  obtenerUltimaTasa = async (req: Request, res: Response) => {
    try {
      const tasaActual = await this.service.obtenerTasaActiva();

      tasaActual ? res.status(200).json(tasaActual) : res.status(404).json({ message: 'No se encontró tasa de cambio activa' });
    } catch (error: any) {
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  };

  aplicarCambiosTarifas = async (req: Request, res: Response) => {
    const transaction = await sequelize.transaction();
    try {
      const { cambios, nuevaTasa } = req.body;
          // cambios: [{ planId: number, tipo: string, nuevaTarifa: number }]
          // nuevaTasa?: { valor: number, moneda: string } (opcional)

          // 1. Crear nueva tasa si viene
      const tasa = nuevaTasa ? await this.service.nuevaTasa(nuevaTasa, transaction) : await this.service.obtenerTasaActiva();
              

          // 2. Crear nuevos planes para los que cambiaron tarifa
      const nombresPlanesAfectados: string[] = [];
      for (const cambio of cambios) {
          const planViejo = await this.planService.obtenerPlan(cambio.tipo, cambio.planId);
          if (!planViejo){ continue };
              // Crear nuevo plan con la nueva tarifa
          nombresPlanesAfectados.push(planViejo.PlanBaseModel.nombre);
      }

          // 3. Tratar solicitudes que usan esos planes
      await this.solicitudService.tratarCambioTarifas(nombresPlanesAfectados, transaction);
      
      const docIds = await this.solicitudService.obtenerDocIdsPorPlanes(nombresPlanesAfectados, transaction);
      for(const cambio of cambios) {
          await this.planService.modificarPlan(cambio.tipo,cambio.planId,tasa!.id,{ tarifa: cambio.nuevaTarifa }, transaction);
        }
          // 4. Marcar documentos como necesitan confirmación
      
      await this.pdfDocService.necesitaConfirmacion(docIds, transaction);

      await transaction.commit();
      res.status(200).json({ success: true, message: 'Cambios aplicados', docIds });
    } catch (error: any) {
      await transaction.rollback();
      res.status(400).json({ success: false, message: error.message });
    }
  };

    obtenerPorId = async (req: Request, res: Response) => {
      try {
          const { id } = req.params;
          const tasa = await this.service.obtenerPorId(parseInt(id.toString()));
          tasa
              ? res.status(200).json(tasa)
              : res.status(404).json({ message: 'Tasa no encontrada' });
      } catch (error: any) {
          res.status(500).json({ error: error.message });
      }
  };

  /*obtenerHistorico = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    try {
      const historico = await this.service.obtenerHistorico(page, limit);
      res.status(200).json({
        data: historico.rows,
        pagination: {
          page,
          limit,
          total: historico.count,
          totalPages: Math.ceil(historico.count / limit),
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  };*/
}