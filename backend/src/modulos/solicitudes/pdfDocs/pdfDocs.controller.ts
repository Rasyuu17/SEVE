import { Request, Response } from 'express';

import sequelize from '../../../config/database';
import { Injectable } from '../../../helpers/decorators/injectable.decorator';
import RepoService from '../../integrationsServices/repoIntegration.service';
import { SolicitudSalaService } from '../solicitudesSala/solicitudSala.service';
import { PdfDocService } from './pdfDocs.service';
import { PlanService } from '../../planes/plan.service';

@Injectable(['PdfDocService', 'SolicitudSalaService', 'RepoService', 'PlanService'])
export class PdfController {
  constructor(
    private pdfDocService: PdfDocService,
    private solicitudSalaService: SolicitudSalaService,
    private repoService: RepoService,
    private planService: PlanService
  ) {}

  buscarDocumento = async (req: Request, res: Response) => {
    try {

      const filtros = (req as any).parsedQuery;
      const resultado = await this.pdfDocService.buscarDocumentos(filtros);

      res.json({
        success: true,
        data: resultado.documentos,
        pagination: {
          page: filtros.page,
          limit: filtros.limit,
          total: resultado.total,
          totalPages: Math.ceil(resultado.total / (filtros.limit || 10)),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al buscar documentos',
      });
    }
  };

  descargarDocumento = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const esFirmado = req.query.firmado === 'true';

      const { buffer, filename } = await this.pdfDocService.descargarPDF(parseInt(id.toString()), esFirmado);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  };

  subirFirmado = async (req: Request, res: Response) => {
    const { id } = req.params;
    const file = req.file as Express.Multer.File;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No se envió ningún archivo' });
    }
    const transaction = await sequelize.transaction();

    try {
      const validacion = await this.pdfDocService.validarFirma(file.buffer);
      // De poder manejarse la verificación de las Autoridades Certificadoras necesarias, descomentar '!validacion.valido||'
      if (/*!validacion.valido||*/ !validacion.integridad || validacion.cantidadFirmas !== 2) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: validacion.error || 'El PDF firmado no es válido',
        });
      }

      const documentoId = parseInt(id.toString());
      await this.solicitudSalaService.aceptarPorDocumento(documentoId, transaction);

      const documento = await this.pdfDocService.buscarDocumentoPorId(documentoId, transaction);
      if (!documento) {
        throw new Error('Documento no encontrado');
      }

      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const nombreRepo = `${documento.tipo}_${documento.entidad.split(' ').join('_')}_firmado.pdf`;
      const nombreFirmado = `${timestamp}_${nombreRepo}`;

      await this.pdfDocService.setDocumentPath(
        documento,
        `${documento.id_contratoGeneral}/${documento.id_contratoEspecifico}/${nombreFirmado}`,
        true,
        transaction
      );
      const response = await this.repoService.subirPDF(
        file.buffer,
        nombreRepo,
        documento.id_contratoGeneral,
        documento.id_contratoEspecifico
      );

      await transaction.commit();

      res.json({
        success: true,
        message: 'Documento firmado subido correctamente',
        data: { direccion_firmado: response.url },
      });
    } catch (error: any) {
      await transaction.rollback();
      res.status(400).json({ success: false, message: error.message });
    }
  };

  confirmarDocumentoSala = async (req: Request, res: Response) => {
    const { documentoId } = req.params;
    const docId = parseInt(documentoId.toString())
    const transaction = await sequelize.transaction();

    try {
        const documento = await this.pdfDocService.buscarDocumentoPorId(docId, transaction);
        
        if (!documento || documento.estado !== 'necesita confirmacion') {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Documento no requiere confirmación' });
        }

        const viejas = await this.solicitudSalaService.obtenerPorDocumento(docId,true);
        const nuevas = await Promise.all(viejas.map(async (vieja) => {
            const planIdsViejos = vieja.PlanCombinadoModel
                ? vieja.PlanCombinadoModel.PlanSalaModels!.map(p => p.id)
                : [vieja.id_planSala];
            const planIdsNuevos = (await Promise.all(
                planIdsViejos.map(async id => {return await this.planService.obtenerUltimaVersionPlan('sala', id, transaction)})
            ));

            const estado = vieja.SolicitudBaseModel!.estado;
            if((estado == 'pendiente' || estado == 'aceptado') && !vieja.SolicitudBaseModel!.confirmado) {
              return await this.solicitudSalaService.crear(
                  vieja.link_vc,
                  docId,
                  planIdsNuevos,
                  vieja.SolicitudBaseModel!.fecha_inicio,
                  vieja.SolicitudBaseModel!.fecha_fin,
                  vieja.grabar,
                  transaction,
                  estado
              );
            }
        }));
        if(nuevas.length==0){
          throw new Error('No se actualizó ninguna solicitud')
        }
        await this.pdfDocService.confirmarDocumento(docId, transaction);
        const idsAEliminar = viejas
            .filter(vieja => 
                vieja.SolicitudBaseModel?.estado === 'pendiente' || 
                vieja.SolicitudBaseModel?.estado === 'aceptado'
            )
            .map(vieja => vieja.id);
        if (idsAEliminar.length > 0) {
            await this.solicitudSalaService.eliminar(idsAEliminar, transaction);
        }
        await transaction.commit();
        res.json({ success: true, data: nuevas });
    } catch (error: any) {
        await transaction.rollback();
        res.status(400).json({ success: false, message: error.message });
    }
};
/*
  generarPDFSala = async (req: Request, res: Response) => {
    try {
      const { id_contratoGeneral, id_contratoEspecifico } = req.query;
      const anexos: any = [];

      const pdfBuffer = await this.pdfDocService.crearPDFSala(
        parseInt(id_contratoGeneral as string),
        parseInt(id_contratoEspecifico as string),
        anexos
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=anexo_sala_${id_contratoGeneral}_${id_contratoEspecifico}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ error: 'Error al generar el documento PDF' });
    }
  };

  visualizarPDFSala = async (req: Request, res: Response) => {
    try {
      const { id_contratoGeneral, id_contratoEspecifico } = req.query;
      const anexos: any = [];

      const pdfBuffer = await this.pdfDocService.crearPDFSala(
        parseInt(id_contratoGeneral as string),
        parseInt(id_contratoEspecifico as string),
        anexos
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=anexo_sala_${id_contratoGeneral}_${id_contratoEspecifico}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ error: 'Error al generar el documento PDF' });
    }
  };*/
}