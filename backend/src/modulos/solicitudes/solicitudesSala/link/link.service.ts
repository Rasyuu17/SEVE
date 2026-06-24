import { Transaction } from 'sequelize';

import sequelize from '../../../../config/database';
import { Injectable } from '../../../../helpers/decorators/injectable.decorator';
import LinkModel from './link.model';

@Injectable()
export class LinkService {
  private model = LinkModel;

  async obtenerLink(nombre: string, transaction?: Transaction) {
    const t = transaction || await sequelize.transaction();
    try {
      const link = await this.model.findByPk(nombre, { transaction: t });

      if (!transaction) {
        await t.commit();
      }
      return link;
    } catch (error) {
      if (!transaction) {
        await t.rollback();
      }
      throw error;
    }
  }

  async guardarLink(nombre: string, transaction?: Transaction) {
    const t = transaction || await sequelize.transaction();
    try {
      const link = await this.model.create({ link: nombre }, { transaction: t });

      if (!transaction) {
        await t.commit();
      }
      return link;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}