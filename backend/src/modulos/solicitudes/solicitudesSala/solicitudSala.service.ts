import { Op, Transaction } from 'sequelize';

import sequelize from '../../../config/database';
import { Injectable } from '../../../helpers/decorators/injectable.decorator';
import TasaCambioModel from '../../tasaCambio/tasaCambio.model';
import PlanBaseModel from '../../planes/planBase.model';
import PlanCombinadoModel from '../../planes/planSala/combinados/planCombinado.model';
import { PlanCombinadoService } from '../../planes/planSala/combinados/planCombinado.service';
import PlanSalaModel from '../../planes/planSala/planSala.model';
import SolicitudBaseModel from '../solicitudBase.model';
import SolicitudSalaModel from './solicitudSala.model';
import DocumentoModel from '../pdfDocs/pdfDocs.model';

export interface CalendarTime {
  fecha_inicio: Date;
  fecha_fin: Date;
  estado: 'pendiente' | 'aceptado';
}

@Injectable(['PlanCombinadoService'])
export class SolicitudSalaService {
  private solicitudSalaModel = SolicitudSalaModel;
  private solicitudBaseModel = SolicitudBaseModel;

  constructor(private combinadoService: PlanCombinadoService) {}

  private aplicarMargen(fecha_inicio: Date, fecha_fin: Date, margenMinutos: number = 30) {
    const inicio = new Date(new Date(fecha_inicio).getTime() - margenMinutos * 60000);
    const fin = new Date(new Date(fecha_fin).getTime() + margenMinutos * 60000);
    return { inicio, fin };
  }

  async crear(
    link_vc: string,
    documento_id: number,
    planSalaId: number[],
    fecha_inicio: Date,
    fecha_fin: Date,
    
    grabar: boolean,
    transaction?: Transaction,
    estado: "pendiente" | "aceptado" = "pendiente",
    confirmado: boolean = true,
    facturacion?: string
  ) {
    const t = transaction || await sequelize.transaction();
    try {
      const esCombinado = planSalaId.length > 1;

      if (!esCombinado) {
        const plan = await PlanSalaModel.findByPk(planSalaId[0], {
          include: [{
            model: PlanBaseModel,
            where: { deletedAt: null },
            required: true,
          }],
          transaction: t,
        });

        if (!plan) {
          throw new Error('El plan no existe o no está activo');
        }
      }

      const nuevoBase = await this.solicitudBaseModel.create({
        documento_id: documento_id,
        fecha_inicio,
        fecha_fin,
        estado,
        confirmado,
        factura: facturacion
      }, { transaction: t });

      const datossolicitud: any = {
        id: nuevoBase.id,
        link_vc,
        grabar,
      };

      if (esCombinado) {
        const planCombinado = await this.combinadoService.crear(
          { planes: planSalaId },
          t
        );
        datossolicitud.id_planCombinado = planCombinado.id;
      } else {
        datossolicitud.id_planSala = planSalaId;
      }

      await this.solicitudSalaModel.create(datossolicitud, { transaction: t });

      const nuevoCompleto = await this.obtenerCompleto(nuevoBase.id, t);

      if (!transaction) {
        await t.commit();
      }
      return nuevoCompleto;
    } catch (error) {
      if (!transaction) {
        await t.rollback();
      }
      throw error;
    }
  }

  async obtenerCompleto(id: number, transaction?: Transaction) {
    const solicitud = await this.solicitudSalaModel.findByPk(id, {
      include: [
        { model: SolicitudBaseModel, required: true },
        {
          model: PlanSalaModel,
          required: false,
          include: [{
            model: PlanBaseModel,
            required: true,
            include: [{ model: TasaCambioModel, required: true }],
          }],
        },
        {
          model: PlanCombinadoModel,
          required: false,
          include: [
            {
              model: PlanSalaModel,
              include: [{
                model: PlanBaseModel,
                required: true,
                include: [{ model: TasaCambioModel, required: true }],
              }],
            },
          ],
        },
      ],
      transaction,
    });

    if (!solicitud) {
      throw new Error('La solicitud no se pudo encontrar');
    }

    if (!solicitud.PlanSalaModel && !solicitud.PlanCombinadoModel) {
      throw new Error('La solicitud no tiene un plan asignado');
    }

    return solicitud;
  }

  async validarDisponibilidad(nombre: string, fecha_inicio: Date, fecha_fin: Date, transaction?: Transaction) {
    const nombres = nombre.split('&&').map(n => n.trim());
    const { inicio: inicioMargen, fin: finMargen } = this.aplicarMargen(fecha_inicio, fecha_fin);

    const planes = await PlanSalaModel.findAll({
      include: [{
        model: PlanBaseModel,
        where: { nombre: { [Op.in]: nombres } },
        paranoid: false,
        required: true,
      }],
      transaction,
    });

    const planIds = planes.map(p => p.id);

    if (planIds.length === 0) {
      return { nombre, valido: false };
    }

    const intermedia = sequelize.models.plan_combinado_plan_sala;

    const filasIntermedia = await intermedia.findAll({
      where: { plan_sala_id: { [Op.in]: planIds } },
      attributes: ['plan_combinado_id'],
      group: ['plan_combinado_id'],
      transaction,
    }) as any[];

    const combinadoIds = filasIntermedia.map(f => f.plan_combinado_id);

    const condicionesPlan: any[] = [
      { id_planSala: { [Op.in]: planIds } },
    ];

    if (combinadoIds.length > 0) {
      condicionesPlan.push({ id_planCombinado: { [Op.in]: combinadoIds } });
    }

    const solicitudesConflictivas = await this.solicitudSalaModel.findAll({
      where: {
        [Op.or]: condicionesPlan,
      },
      include: [{
        model: SolicitudBaseModel,
        where: {
          estado: { [Op.in]: ['pendiente', 'aceptado'] },
          [Op.or]: [
            { fecha_inicio: { [Op.between]: [inicioMargen, finMargen] } },
            { fecha_fin: { [Op.between]: [inicioMargen, finMargen] } },
            {
              [Op.and]: [
                { fecha_inicio: { [Op.lte]: inicioMargen } },
                { fecha_fin: { [Op.gte]: finMargen } },
              ],
            },
          ],
        },
        required: true,
      }],
      transaction,
    });

    return {
      nombre,
      valido: solicitudesConflictivas.length === 0,
    };
  }

  validarFechasLocales(fecha_inicio: Date[], fecha_fin: Date[], nombres: string[]) {
      const UNA_HORA = 60 * 60 * 1000;
      const MIN_BEGIN_DATE = Date.now() + UNA_HORA;
      const MEDIA_HORA = UNA_HORA / 2;

      return fecha_inicio.map((inicio, index) => {
          const ini = inicio.getTime();
          const fin = fecha_fin[index].getTime();
          const solapa = fecha_inicio.some((otroInicio, j) => {
            if (j === index) return false;
            const otroFin = fecha_fin[j].getTime();
            const iniActual = inicio.getTime();
            const finActual = fecha_fin[index].getTime();
            
            return (iniActual < otroFin + MEDIA_HORA && otroInicio.getTime() < finActual + MEDIA_HORA);
          });

          return {
              nombre: nombres[index],
              valido: ini >= MIN_BEGIN_DATE && fin - ini >= UNA_HORA && !solapa
          };
      });
  }

  async obtenerPorMes(month: number, year: number, nombre: string) {
    const fecha_inicio = new Date(year, month - 1, 1);
    const fecha_fin = new Date(year, month, 0);
    const { inicio: inicioMargen, fin: finMargen } = this.aplicarMargen(fecha_inicio, fecha_fin);

    const whereBase = {
      estado: { [Op.in]: ['pendiente', 'aceptado'] },
      [Op.or]: [
        { fecha_inicio: { [Op.between]: [inicioMargen, finMargen] } },
        { fecha_fin: { [Op.between]: [inicioMargen, finMargen] } },
        {
          [Op.and]: [
            { fecha_inicio: { [Op.lte]: inicioMargen } },
            { fecha_fin: { [Op.gte]: finMargen } },
          ],
        },
      ],
    };

    

    const simples = await this.solicitudSalaModel.findAll({
      include: [
        {
          model: SolicitudBaseModel,
          attributes: ['fecha_inicio', 'fecha_fin', 'estado'],
          where: whereBase,
          required: true,
        },
        {
          model: PlanSalaModel,
          required: true,
          include: [{
            model: PlanBaseModel,
            where: { nombre: { [Op.eq]: nombre } },
            paranoid: false,
            required: true,
          }],
        },
      ],
    });

    const combinados = await this.solicitudSalaModel.findAll({
      include: [
        {
          model: SolicitudBaseModel,
          attributes: ['fecha_inicio', 'fecha_fin', 'estado'],
          where: whereBase,
          required: true,
        },
        {
          model: PlanCombinadoModel,
          required: true,
          include: [{
            model: PlanSalaModel,
            required: true,
            include: [{
              model: PlanBaseModel,
              where: { nombre: { [Op.eq]: nombre } },
              paranoid: false,
              required: true,
            }],
          }],
        },
      ],
    });

    const resultado: any[] = [];

    for (const solicitud of simples) {
      resultado.push({
        ...solicitud.SolicitudBaseModel!.toJSON(),
        plan: solicitud.PlanSalaModel!.PlanBaseModel,
      });
    }

    for (const solicitud of combinados) {
      const planSalasFiltrados = solicitud.PlanCombinadoModel!.PlanSalaModels!
        .filter(planSala => planSala.PlanBaseModel && planSala.PlanBaseModel.nombre === nombre);
      for (const planSala of planSalasFiltrados) {
        resultado.push({
          ...solicitud.SolicitudBaseModel!.toJSON(),
          plan: planSala.PlanBaseModel,
        });
      }
    }

    return resultado;
  }

  async anularSolicitudesExpiradas(docsIds: number[], transaction?: Transaction): Promise<number> {
    const [count] = await SolicitudBaseModel.update(
        { estado: 'anulado' },
        {
            where: {
                estado: 'pendiente',
                documento_id: {[Op.in] : docsIds},
            },
            transaction,
        }
    );

    return count;
  }

  async obtenerCalendarioOperativo(month: number, year: number) {
      const fecha_inicio = new Date(year, month - 1, 1);
      const fecha_fin = new Date(year, month, 0);

      const whereBase = {
          estado: { [Op.in]: ['pendiente', 'aceptado'] },
          [Op.or]: [
              { fecha_inicio: { [Op.between]: [fecha_inicio, fecha_fin] } },
              { fecha_fin: { [Op.between]: [fecha_inicio, fecha_fin] } },
              {
                  [Op.and]: [
                      { fecha_inicio: { [Op.lte]: fecha_inicio } },
                      { fecha_fin: { [Op.gte]: fecha_fin } },
                  ],
              },
          ],
      };

      const solicitudes = await this.solicitudSalaModel.findAll({
          include: [
              {
                  model: SolicitudBaseModel,
                  attributes: ['id', 'fecha_inicio', 'fecha_fin', 'estado', 'confirmado'],
                  where: whereBase,
                  required: true,
                  include: [{
                      model: DocumentoModel,
                      attributes: ['entidad'],
                  }],
              },
              {
                  model: PlanSalaModel,
                  required: false,
                  include: [{
                      model: PlanBaseModel,
                      attributes: ['nombre'],
                      paranoid: false,
                      required: true,
                  }],
              },
              {
                  model: PlanCombinadoModel,
                  required: false,
                  include: [{
                      model: PlanSalaModel,
                      required: true,
                      include: [{
                          model: PlanBaseModel,
                          attributes: ['nombre'],
                          paranoid: false,
                          required: true,
                      }],
                  }],
              },
          ],
      });

      return solicitudes.map(sol => {
          const base = sol.SolicitudBaseModel!;
          const planSimple = sol.PlanSalaModel?.PlanBaseModel?.nombre;
          const planCombinado = sol.PlanCombinadoModel?.PlanSalaModels
              ?.map((p: any) => p.PlanBaseModel?.nombre).join(' + ');

          return {
              id: base.id,
              title: planSimple || planCombinado || 'Sin plan',
              entidad: (base as any).DocumentoModel?.entidad || 'Sin entidad',
              fecha_inicio: base.fecha_inicio,
              fecha_fin: base.fecha_fin,
              estado: base.estado,
              confirmado: base.confirmado,
              grabar: sol.grabar,
              link_vc: sol.link_vc,
          };
      });
  }

  async aceptarPorDocumento(documentoId: number, transaction: Transaction): Promise<void> {
    await SolicitudBaseModel.update(
      { estado: 'aceptado' },
      { where: { documento_id: documentoId }, transaction }
    );
  }

  async obtenerPorDocumento(documentoId: number, paranoid: boolean = false): Promise<SolicitudSalaModel[]> {
    return await this.solicitudSalaModel.findAll({
      include: [
        {
          model: SolicitudBaseModel,
          where: { documento_id: documentoId },
          attributes: ['id', 'fecha_inicio', 'fecha_fin', 'estado', 'createdAt', 'confirmado', 'deletedAt'],
          paranoid
        },
        {
          model: PlanSalaModel,
          include: [
            {
              model: PlanBaseModel,
              paranoid: false,
              attributes: ['nombre', 'tarifa', 'normalizacionTiempo'],
              include: [
                { model: TasaCambioModel, attributes: ['tasa'],
                  paranoid: false,
                  required: true
                 },
              ],
            },
          ],
        },
        {
          model: PlanCombinadoModel,
          include: [
            {
              model: PlanSalaModel,
              include: [
                {
                  model: PlanBaseModel,
                  paranoid: false,
                  attributes: ['nombre', 'tarifa', 'tasa_fk', 'normalizacionTiempo'],
                  include: [
                    { model: TasaCambioModel, attributes: ['tasa'],
                      paranoid: false,
                      required: true
                     },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  }

  async obtenerDocIdsPorPlanes(nombresPlanes: string[], transaction?: Transaction): Promise<number[]> {
    const solicitudes = await this.solicitudSalaModel.findAll({
        include: [
            {
                model: SolicitudBaseModel,
                attributes: ['documento_id'],
                where: {estado: {[Op.in]: ['pendiente', 'aceptado'] }},
                required: true,
                paranoid: false
            },
            {
                model: PlanSalaModel,
                required: false,
                include: [{
                    model: PlanBaseModel,
                    where: { nombre: { [Op.in]: nombresPlanes } },
                    required: true,
                    paranoid: false,
                }]
            },
            {
                model: PlanCombinadoModel,
                required: false,
                include: [{
                    model: PlanSalaModel,
                    required: true,
                    include: [{
                        model: PlanBaseModel,
                        where: { nombre: { [Op.in]: nombresPlanes } },
                        required: true,
                        paranoid: false,
                    }]
                }]
            }
        ],
        transaction
    });

    return [...new Set(solicitudes.map(s => s.SolicitudBaseModel!.documento_id))];
  }

  async cancelar(id: number, transaction?: Transaction): Promise<number> {
    const solicitud = await SolicitudBaseModel.findByPk(id, {paranoid: false});
    if (!solicitud) {
      throw new Error('Solicitud no encontrada');
    }

    if (solicitud.estado === 'pendiente' || !solicitud.confirmado) {
      await solicitud.update({ estado: 'anulado' }, { transaction });
    } else if (solicitud.estado === 'aceptado') {
      await solicitud.update({ estado: 'cancelado' }, { transaction });
    } else {
      throw new Error(`No se puede cancelar una solicitud en estado "${solicitud.estado}"`);
    }

    return solicitud.documento_id
  }

  async cancelarPorDocumento(documentoId: number, transaction?: Transaction): Promise<void> {
    const [countAnuladas] = await SolicitudBaseModel.update(
      { estado: 'anulado' },
      { where: { 
        documento_id: documentoId,
        [Op.or]: {
          estado: 'pendiente',
          confirmado: false
        }
      }, 
      transaction,
      paranoid: false }
    );

    const [countCanceladas] = await SolicitudBaseModel.update(
      { estado: 'cancelado' },
      { where: { documento_id: documentoId, estado: 'aceptado' }, transaction,
      paranoid:false }
    );
    if(countAnuladas+countCanceladas===0){
      throw new Error('Ninguna solicitud fue afectada')
    }
  }

  async tratarCambioTarifas(nombresPlanes: string[], transaction?: Transaction): Promise<void> {
      const solicitudes = await this.solicitudSalaModel.findAll({
          include: [
              {
                  model: SolicitudBaseModel,
                  where: { estado: { [Op.in]: ['pendiente', 'aceptado'] } },
                  required: true
              },
              {
                  model: PlanSalaModel,
                  required: false,
                  include: [{
                      model: PlanBaseModel,
                      where: { nombre: { [Op.in]: nombresPlanes } },
                      required: true
                  }]
              },
              {
                  model: PlanCombinadoModel,
                  required: false,
                  include: [{
                      model: PlanSalaModel,
                      required: true,
                      include: [{
                          model: PlanBaseModel,
                          where: { nombre: { [Op.in]: nombresPlanes } },
                          required: true
                      }]
                  }]
              }
          ],
          transaction
      });

      const ids = solicitudes.map(s => s.id);

      await this.solicitudBaseModel.update(
        {confirmado: false},
        { where: { id: { [Op.in]: ids } }, transaction}
      );
  }

  async revisarVigencia(docId: number, transaction?: Transaction): Promise<boolean>{
    const solicitudes = await this.solicitudBaseModel.findAll({
      where: {documento_id: docId},
      transaction
    })

    const inactivasTodas = solicitudes.every(solicitud =>solicitud.estado != 'pendiente' && solicitud.estado != 'aceptado' && solicitud.estado != 'por facturar' )
    if(inactivasTodas){
      await DocumentoModel.update({
        estado: 'terminado'
      },{
        where: {id: docId},
        transaction
      })
    }
    return inactivasTodas;
  }

  async eliminar(ids: number[], transaction?: Transaction) {
    await this.solicitudBaseModel.destroy({
      where: { id: ids },
      transaction
    })
  }
}