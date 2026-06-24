import { Op, Transaction } from 'sequelize';

import sequelize from '../../../config/database';
import { Injectable } from '../../../helpers/decorators/injectable.decorator';
import { IPlanStrategy, PlanCompleto } from '../IPlanStrategy.interface';
import PlanBaseModel from '../planBase.model';
import { PlanBaseType } from '../planBase.validator';
import TasaCambioModel from '../../tasaCambio/tasaCambio.model';
import PlanSalaModel from './planSala.model';
import { PlanSalaType, planSalaUpdateSchema } from './planSala.validator';
import SalaModel from './sala/sala.model';
import { SalaService } from './sala/sala.service';

interface PlanSalaExtras {
  salas_ids: number[];
}

@Injectable(['SalaService'])
export class PlanSalaStrategy implements IPlanStrategy<PlanSalaType> {
  private baseModel = PlanBaseModel;
  private planSalaModel = PlanSalaModel;
  private salaModel = SalaModel;

  constructor(
    private salaService: SalaService
  ) {}

  async crear(
    data: PlanBaseType & PlanSalaType & { extras?: PlanSalaExtras },
    id_tasa: number,
    transaction?: Transaction
  ): Promise<PlanCompleto & PlanSalaModel> {
    const baseData = this.baseModel.validate(data);
    const specificSalaData = this.planSalaModel.validate(data);
    const t = transaction || await sequelize.transaction();
    const usarTransaccion = !!transaction;

    try {
      if (data.extras?.salas_ids?.length) {
        await this.salaService.validarSalasDisponibles(data.extras.salas_ids, t);
      }
      if (!usarTransaccion) {
        const exist = await this.baseModel.findOne({
          where: { nombre: { [Op.eq]: baseData.nombre } },
          transaction: t,
        });
        if (exist) {
          throw new Error('Un plan con ese nombre ya existe');
        }
      }
      const createdPlan = await this.baseModel.create({
        ...baseData,
        tasa_fk: id_tasa,
      }, { transaction: t });

      await this.planSalaModel.create({
        id: createdPlan.id,
        ...specificSalaData,
      }, { transaction: t });
      if (data.extras?.salas_ids?.length) {
        const intermedia = sequelize.models.plan_sala_sala;
        await intermedia.bulkCreate(
          data.extras.salas_ids.map(sala_id => ({
            plan_id: createdPlan.id,
            sala_id: sala_id,
          })),
          { transaction: t }
        );
      }
      const planCompleto = await this.planSalaModel.findByPk(createdPlan.id, {
        include: [this.baseModel, this.salaModel],
        transaction: t,
      });

      if (!usarTransaccion) {
        await t.commit();
      }
      return planCompleto as unknown as PlanCompleto & PlanSalaModel;
    } catch (error) {
      if (!usarTransaccion) {
        await t.rollback();
      }
      throw error;
    }
  }

  async obtenerTodos(): Promise<(PlanCompleto & PlanSalaModel)[]> {
    const planes = await this.planSalaModel.findAll({
      include: [
        {
          model: this.baseModel,
          required: true,
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
          include: [
            {
              model: TasaCambioModel,
              attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
            },
          ],
        },
        { model: this.salaModel },
      ],
      order: [[this.baseModel, 'tarifa', 'ASC']],
    });
    return planes as unknown as (PlanCompleto & PlanSalaModel)[];
  }

  async modificar(
    id: number,
    data: Partial<PlanBaseType & PlanSalaType> & { extras?: { salas_ids?: number[] } },
    id_tasa: number,
    transaction?: Transaction
  ): Promise<PlanCompleto & PlanSalaModel> {
    await planSalaUpdateSchema.parseAsync(data);
    const t = transaction || await sequelize.transaction();

    try {
      const planExistente = await this.planSalaModel.findByPk(id, {
        include: [this.baseModel, { model: this.salaModel }],
        transaction: t,
      });
      if (!planExistente) {
        throw new Error('Plan sala no encontrado');
      }

      const baseActual = planExistente.PlanBaseModel!;
      const salasActuales = (planExistente as any).SalaModels || [];

      const nuevosDatosBase = { ...baseActual.toJSON(), ...data };
      const nuevosDatosSpecific = { ...planExistente.toJSON(), ...data };
      await this.baseModel.destroy({ where: { id }, transaction: t });

      const newBase = await this.baseModel.create({
        ...nuevosDatosBase,
        tasa_fk: id_tasa,
        id: undefined,
        nombre: baseActual.nombre,
      }, { transaction: t });

      const { id: _id, ...specificSinId } = nuevosDatosSpecific;

      await this.planSalaModel.create({
        id: newBase.id,
        ...specificSinId,
      }, { transaction: t });

      const intermedia = sequelize.models.plan_sala_sala;
      const salasIds = data.extras?.salas_ids ?? salasActuales.map((s: any) => s.id);

      if (salasIds.length > 0) {
        await intermedia.bulkCreate(
          salasIds.map((sala_id: number) => ({ plan_id: newBase.id, sala_id })),
          { transaction: t }
        );
      }

      const completo = await this.obtenerCompleto(newBase.id,t)
      if(!transaction){
        await t.commit();
      }
      return completo;
    } catch (error) {
      if(!transaction){
        await t.rollback();
      }
      throw error;
    }
  }

  async eliminar(id: number, transaction?: Transaction): Promise<PlanCompleto & PlanSalaModel> {
    const t = transaction || await sequelize.transaction();
    const usarTransaccion = !!transaction;

    try {
      const plan = await this.obtenerCompleto(id);
      await this.baseModel.destroy({ where: { id }, transaction: t });

      if (!usarTransaccion) {
        await t.commit();
      }
      return plan;
    } catch (error) {
      if (!usarTransaccion) {
        await t.rollback();
      }
      throw error;
    }
  }

  async obtenerCompleto(id: number, transaction?: Transaction): Promise<PlanCompleto & PlanSalaModel> {
    const plan = await this.planSalaModel.findByPk(id, {
      include: [
        { model: this.baseModel, required: true },
        { model: this.salaModel },
      ],transaction
    });
    if (!plan) {
      throw new Error('Plan sala no encontrado');
    }
    return plan as unknown as PlanCompleto & PlanSalaModel;
  }

  async encontrarUltimaVersion(planViejoId: number, transaction?: Transaction): Promise<number> {
    const planViejo = await PlanSalaModel.findByPk(planViejoId, {
        include: [{ model: PlanBaseModel, paranoid: false }],
        transaction
    });

    if (!planViejo?.PlanBaseModel) return planViejoId;

    const nombre = planViejo.PlanBaseModel.nombre;

    const ultimaVersion = await PlanSalaModel.findOne({
        include: [{
            model: PlanBaseModel,
            where: { nombre, deletedAt: null },
            required: true
        }],
        transaction
    });

    return ultimaVersion ? ultimaVersion.id : planViejoId;
  }

  /*async versionarPorNuevaTasa(tasa_id: number, transaction: Transaction): Promise<void> {
    const planes = await this.obtenerTodos();

    for (const plan of planes) {
      const baseData = (plan as any).PlanBaseModel;
      const specificData = plan as unknown as PlanSalaType;

      const dataToCreate = {
        nombre: baseData.nombre,
        normalizacionTiempo: baseData.normalizacionTiempo,
        tarifa: baseData.tarifa,
        categoriaAnexable: baseData.categoriaAnexable,
        esIntegrable: specificData.esIntegrable,
        esNacional: specificData.esNacional,
        cantUsuariosLinea: specificData.cantUsuariosLinea,
        cantUsuariosInvitados: specificData.cantUsuariosInvitados,
        tieneVCReunionInteligente: specificData.tieneVCReunionInteligente,
        tieneVCTodosPantalla: specificData.tieneVCTodosPantalla,
        tieneVCRolesModerados: specificData.tieneVCRolesModerados,
        tieneVCClaseVirtual: specificData.tieneVCClaseVirtual,
        tieneColabEdicionAgenda: specificData.tieneColabEdicionAgenda,
        tieneColabRealizarLlamadas: specificData.tieneColabRealizarLlamadas,
        tieneColabCrearConferencias: specificData.tieneColabCrearConferencias,
        tieneColabCompartirPantalla: specificData.tieneColabCompartirPantalla,
        tieneColabControlRemoto: specificData.tieneColabControlRemoto,
        tieneColabPresentacion: specificData.tieneColabPresentacion,
        tieneColabEnviarArchivos: specificData.tieneColabEnviarArchivos,
        tieneColabRecibirArchivos: specificData.tieneColabRecibirArchivos,
        tieneColabGrabacion: specificData.tieneColabGrabacion,
        tiempoAlmacenamiento: specificData.tiempoAlmacenamiento,
        almacenamientoLocal: specificData.almacenamientoLocal,
        extras: {
          salas_ids: (specificData as any).SalaModels?.map((s: any) => s.id) || [],
        },
      };

      await this.eliminar(plan.PlanBaseModel!.id, transaction);
      await this.crear(dataToCreate, tasa_id, transaction);
    }
  }*/
}