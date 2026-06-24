import { Op, Sequelize, Transaction } from 'sequelize';

import sequelize from '../../../../config/database';
import { Injectable } from '../../../../helpers/decorators/injectable.decorator';
import PlanBaseModel from '../../planBase.model';
import PlanSalaModel from '../planSala.model';
import SalaModel from './sala.model';
import { SalaType } from './sala.validator';

interface PlanSalaConSalas extends PlanSalaModel {
  SalaModels?: SalaModel[];
}

@Injectable()
export class SalaService {
  private model = SalaModel;

  async crear(data: SalaType): Promise<SalaModel> {
    return await this.model.create(data);
  }

  async obtenerTodas(): Promise<SalaModel[]> {
    return await this.model.findAll();
  }

  async obtenerPorId(id: number): Promise<SalaModel | null> {
    return await this.model.findByPk(id);
  }

  async obtenerSalasPorPlan(planSalaId: number) {
    const planConSalas = await PlanSalaModel.findByPk(planSalaId, {
      include: [{
        model: this.model,
        through: { attributes: [] },
      }],
    }) as PlanSalaConSalas;

    if (!planConSalas) {
      throw new Error('Plan no encontrado');
    }

    return planConSalas.SalaModels;
  }

  async obtenerDisponibles(transaction?: Transaction): Promise<SalaModel[]> {
    return await this.model.findAll({
      where: {
        id: {
          [Op.notIn]: Sequelize.literal(`(
            SELECT DISTINCT pss.sala_id
            FROM plan_sala_sala pss
            JOIN plan_sala ps ON pss.plan_id = ps.id
            JOIN plan_base pb ON ps.id = pb.id
            WHERE pb."deletedAt" IS NULL
          )`),
        },
      },
      transaction,
    });
  }

  async validarSalasDisponibles(salas_ids: number[], transaction?: Transaction): Promise<void> {
    const salasOcupadas = await this.model.findAll({
      where: { id: salas_ids },
      include: [{
        model: PlanSalaModel,
        as: 'planes',
        required: true,
        include: [{
          model: PlanBaseModel,
          as: 'PlanBaseModel',
          where: { deletedAt: null },
          attributes: [],
        }],
        attributes: [],
        through: { attributes: [] },
      }],
      transaction,
    });

    if (salasOcupadas.length > 0) {
      const nombres = salasOcupadas.map(s => s.nombre).join(', ');
      throw new Error(`Las siguientes salas ya están asociadas a un plan activo: ${nombres}`);
    }
  }

  async modificar(id: number, data: SalaType): Promise<SalaModel> {
    const transaction = await sequelize.transaction();

    try {
      const salaExistente = await this.model.findByPk(id, { transaction });
      if (!salaExistente) {
        throw new Error('Sala no encontrada');
      }

      await this.validarSalaNoAsociadaAPlanActivo(id, transaction);

      await this.model.destroy({ where: { id }, transaction });

      const nuevaSala = await this.model.create(data, { transaction });

      await transaction.commit();
      return nuevaSala;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async eliminar(id: number): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      const salaExistente = await this.model.findByPk(id, { transaction });
      if (!salaExistente) {
        throw new Error('Sala no encontrada');
      }

      await this.validarSalaNoAsociadaAPlanActivo(id, transaction);

      await this.model.destroy({ where: { id }, transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  private async validarSalaNoAsociadaAPlanActivo(sala_id: number, transaction: Transaction): Promise<void> {
    const planesActivos = await PlanSalaModel.findAll({
      include: [
        {
          model: this.model,
          where: { id: sala_id },
          through: { attributes: [] },
        },
        {
          model: PlanBaseModel,
          where: { deletedAt: null },
          attributes: [],
        },
      ],
      transaction,
    });

    if (planesActivos.length > 0) {
      throw new Error('No se puede modificar o eliminar la sala porque está asociada a un plan activo');
    }
  }
}