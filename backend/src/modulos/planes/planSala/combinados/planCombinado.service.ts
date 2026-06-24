import { Transaction } from 'sequelize';

import sequelize from '../../../../config/database';
import { Injectable } from '../../../../helpers/decorators/injectable.decorator';
import PlanBaseModel from '../../planBase.model';
import PlanSalaModel from '../planSala.model';
import PlanCombinadoModel from './planCombinado.model';
import { PlanCombinadoCreationType } from './planCombinado.validator';

@Injectable([])
export class PlanCombinadoService {
  private model = PlanCombinadoModel;

  constructor() {}

  async crear(data: PlanCombinadoCreationType, transaction?: Transaction) {
    const t = transaction || await sequelize.transaction();

    const planes = await PlanSalaModel.findAll({
      where: { id: data.planes },
      include: [{
        model: PlanBaseModel,
        required: true,
        paranoid: false,
      }],
      transaction: t,
    });
    if(planes.length!=data.planes.length){
      throw new Error('No se puede crear combinado. Algunos planes no están disponibles')
    }
    const noIntegrables = planes.filter(p => !p.esIntegrable);
    if (noIntegrables.length > 0) {
      throw new Error(`No se puede crear combinado. Planes no integrables: ${noIntegrables.map(p => p.id).join(', ')}`);
    }
    const eliminados = planes.filter(p => p.PlanBaseModel?.deletedAt !== null);
    if (eliminados.length > 0) {
      throw new Error(`No se puede crear combinado. Planes eliminados: ${eliminados.map(p => p.id).join(', ')}`);
    }

    try {
      const existenteId = await this.buscarCombinadoExistente(data.planes, t);
      if (existenteId) {
        const plan = await this.obtenerPorId(existenteId, t);
        if (!transaction) {
          await t.commit();
        }
        return plan;
      }
      const planesOrdenados = [...data.planes].sort((a, b) => a - b);

      const combinado = await this.model.create({}, { transaction: t });

      const intermedia = sequelize.models.plan_combinado_plan_sala;
      await intermedia.bulkCreate(
        planesOrdenados.map(plan_id => ({
          plan_combinado_id: combinado.id,
          plan_sala_id: plan_id,
        })),
        { transaction: t }
      );

      const plan = await this.obtenerPorId(combinado.id, t);
      if (!transaction) {
        await t.commit();
      }
      return plan;
    } catch (error) {
      if (!transaction) {
        await t.rollback();
      }
      throw error;
    }
  }

  private async buscarCombinadoExistente(planes: number[], transaction: Transaction) {
    const planesOrdenados = [...planes].sort((a, b) => a - b);
    const intermedia = sequelize.models.plan_combinado_plan_sala;

    const posibles: { plan_combinado_id: number; plan_sala_id: number }[] = await intermedia.findAll({
      attributes: ['plan_combinado_id'],
      group: ['plan_combinado_id'],
      having: sequelize.literal(`COUNT(*) = ${planesOrdenados.length}`),
      transaction,
    }) as any;

    if (!posibles.length) {
      return null;
    }

    const posiblesIds = posibles.map(p => p.plan_combinado_id);

    const existentes = await intermedia.findAll({
      where: { plan_combinado_id: posiblesIds },
      attributes: ['plan_combinado_id', 'plan_sala_id'],
      order: [['plan_combinado_id', 'ASC'], ['plan_sala_id', 'ASC']],
      transaction,
    }) as any;

    const combinadosMap = new Map<number, number[]>();
    for (const item of existentes) {
      if (!combinadosMap.has(item.plan_combinado_id)) {
        combinadosMap.set(item.plan_combinado_id, []);
      }
      combinadosMap.get(item.plan_combinado_id)!.push(item.plan_sala_id);
    }

    for (const [combinadoId, ids] of combinadosMap) {
      if (ids.sort((a, b) => a - b).join(',') === planesOrdenados.join(',')) {
        return combinadoId;
      }
    }

    return null;
  }

  async obtenerPorId(id: number, transaction?: Transaction) {
    const combinado = await this.model.findByPk(id, {
      include: [{
        model: PlanSalaModel,
        include: [PlanBaseModel],
      }],
      transaction,
    });

    if (!combinado) {
      throw new Error('Plan combinado no encontrado');
    }

    return combinado;
  }
}