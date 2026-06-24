import { Request, Response } from 'express';

import sequelize from '../../../config/database';
import { Injectable } from '../../../helpers/decorators/injectable.decorator';
import RepoService from '../../integrationsServices/repoIntegration.service';
import { DocumentDiscriminator } from '../pdfDocs/pdfDocs.interface';
import { PdfDocService } from '../pdfDocs/pdfDocs.service';
import { LinkService } from './link/link.service';
import { SolicitudSalaService } from './solicitudSala.service';
import { creationSolicitudType, validationType } from './solicitudSala.schemas';

@Injectable(['SolicitudSalaService', 'LinkService', 'PdfDocService', 'RepoService'])
export class SolicitudSalaController {
  constructor(
    private service: SolicitudSalaService,
    private link: LinkService,
    private pdfService: PdfDocService,
    private repoService: RepoService,
  ) {}

  crear = async (req: Request, res: Response) => {
    const transaction = await sequelize.transaction();
    try {
      const {
        link_vc,
        nombre_solicitante,
        entidad,
        contrato_generalId,
        contrato_especificoId,
        correo,
        planesSalaIds,
        nombre,
        fecha_inicio,
        fecha_fin,
        numero,
        info_contrato,
        grabar,
        cargo
      }: creationSolicitudType = req.body;

      const entidad_snake = entidad.split(' ').join('_');

      const existeLink = await this.link.obtenerLink(link_vc, transaction);
      if (existeLink) {
        throw new Error('El link de conferencia ya está en uso');
      }

      const validaciones = await Promise.all(
        nombre.map((n, i) =>
          this.service.validarDisponibilidad(
            n,
            fecha_inicio[i],
            fecha_fin[i],
            transaction
          )
        )
      );
      const invalidos = validaciones.filter(v => !v.valido);
      if (invalidos.length > 0) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          message: 'Algunos planes no están disponibles',
          data: validaciones,
        });
      }

      await this.link.guardarLink(link_vc, transaction);

      const nombre_documento = `${DocumentDiscriminator.SOLICITUD_SALA}_${entidad_snake}.pdf`;

      const documento = await this.pdfService.crear(
        numero,
        contrato_generalId,
        contrato_especificoId,
        nombre_solicitante,
        entidad,
        correo,
        nombre_documento,
        DocumentDiscriminator.SOLICITUD_SALA,
        transaction
      );

      const solicitudes = await Promise.all(
        nombre.map((n, i) =>
          this.service.crear(
            link_vc,
            documento.id,
            planesSalaIds[i],
            fecha_inicio[i],
            fecha_fin[i],
            grabar[i],
            transaction
          )
        )
      );

      const pdfBuffer = await this.pdfService.crearPDFSala(
        contrato_generalId,
        contrato_especificoId,
        solicitudes,
        info_contrato,{
            entidad,
            solicitante: nombre_solicitante,
            correo,
            numero: numero.toString(),
            cargo
        }
      );

      const repoResponse = await this.repoService.subirPDF(
        pdfBuffer,
        nombre_documento,
        contrato_generalId,
        contrato_especificoId
      );

      await transaction.commit();
      res.status(201).json({
        success: true,
        message: 'Solicitud creada exitosamente',
        data: {
          documentoId: documento.id,
          entidad: documento.entidad,
          contrato_generalId: documento.id_contratoGeneral,
          contrato_especificoId: documento.id_contratoEspecifico,
        },
      });
    } catch (error: any) {
      await transaction.rollback();

      if (error.issues) {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: error.issues,
        });
      }

      res.status(400).json({ success: false, error: error.message });
    }
  };

  obtener = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const solicitud = await this.service.obtenerCompleto(parseInt(id.toString()));
      if (!solicitud) {
        return res.status(404).json({ message: 'No se encontró el elemento' });
      }
      res.status(200).json({ success: true, data: solicitud });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  };

  obtenerCalendario = async (req: Request, res: Response) => {
    try {
      const { month, year, name } = req.params;
      const calendario = await this.service.obtenerPorMes(
        parseInt(month.toString()),
        parseInt(year.toString()),
        name.toString()
      );
      calendario.length
        ? res.status(200).json({ success: true, data: calendario })
        : res.status(404).json({ success: false, message: 'No se encontraron elementos' });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  };
  
  obtenerCalendarioOperativo = async (req: Request, res: Response) => {
    try {
        const { month, year } = req.params;
        const calendario = await this.service.obtenerCalendarioOperativo(
            parseInt(month.toString()),
            parseInt(year.toString())
        );
        calendario.length
            ? res.status(200).json({ success: true, data: calendario })
            : res.status(404).json({ success: false, message: 'No se encontraron elementos' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

  validar = async (req: Request, res: Response) => {
    try {
      const { nombre, fecha_inicio, fecha_fin }: validationType = req.body;
      const fechasInicio = fecha_inicio.map(f => new Date(f));
      const fechasFin = fecha_fin.map(f => new Date(f));
      const localValidations = this.service.validarFechasLocales(fechasInicio, fechasFin, nombre);
      const validations = await Promise.all(
        nombre.map((n: string, i: number) =>
          localValidations[i].valido ?
          this.service.validarDisponibilidad(n, fecha_inicio[i], fecha_fin[i]) :
          localValidations[i]
        )
      );

      res.status(200).json({ success: true, data: validations });
    } catch (error: any) {
      if (error.issues) {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: error.issues,
        });
      }
      res.status(400).json({ success: false, error: error.message });
    }
  };

  obtenerPorDocumento = async (req: Request, res: Response) => {
    try {
      const { documentoId } = req.params;
      const solicitudes = await this.service.obtenerPorDocumento(parseInt(documentoId.toString()),true);
      res.json({ success: true, data: solicitudes });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  };

  cancelar = async (req: Request, res: Response) => {
    const transaction = await sequelize.transaction()
    try {
      const { id } = req.params;
      const docId = await this.service.cancelar(parseInt(id.toString()),transaction);
      
      await this.service.revisarVigencia(docId, transaction);
      transaction.commit()
      res.json({ success: true, message: 'Solicitud cancelada' });
    } catch (error: any) {
      transaction.rollback()
      res.status(error.message?.includes('no encontrad') ? 404 : 400).json({ success: false, message: error.message });
    }
  };

  cancelarPorDocumento = async (req: Request, res: Response) => {
    const transaction = await sequelize.transaction()
    try {
      const { documentoId } = req.params;
      await this.service.cancelarPorDocumento(parseInt(documentoId.toString()),transaction);
      await this.service.revisarVigencia(parseInt(documentoId.toString()), transaction);
      transaction.commit()
      res.json({ success: true, message: 'Solicitudes canceladas' });
    } catch (error: any) {
      transaction.rollback();
      res.status(error.message =='Ninguna solicitud fue afectada' ? 404 : 400).json({ success: false, message: error.message });
    }
  };
}