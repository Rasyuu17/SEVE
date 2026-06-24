import { Transaction } from 'sequelize';
import { Injectable } from '../../helpers/decorators/injectable.decorator';
import TasaCambioModel from './tasaCambio.model';

@Injectable()
export class TasaCambioService {
  private model = TasaCambioModel;

  constructor() {}

  async nuevaTasa(rate: number, transaction?: Transaction): Promise<TasaCambioModel> {
    const tasaActiva = await this.model.findOne({ transaction });
    if (tasaActiva) {
      await tasaActiva.destroy({ transaction });
    }

    return await this.model.create({ tasa: rate }, { transaction });
  }

  async initTasa(transaction?: Transaction): Promise<boolean> {
    const tasaActiva = await this.model.findOne({ transaction });
    if (tasaActiva) {
      return true;
    }
    const tasa = await this.nuevaTasa(100,transaction);
    return !!tasa;
  }

  async obtenerTasaActiva(transaction?: Transaction): Promise<TasaCambioModel | null> {
    return await this.model.findOne({ transaction });
  }
/*
  async obtenerHistorico(page: number = 1, limit: number = 10): Promise<{ rows: TasaCambioModel[]; count: number }> {
    const offset = (page - 1) * limit;

    return await this.model.findAndCountAll({
      attributes: ['id', 'tasa', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      paranoid: false,
    });
  }*/

  async obtenerPorId(id: number): Promise<TasaCambioModel | null> {
    return await this.model.findByPk(id, { paranoid: false, attributes: ['id', 'tasa'] });
  }
}