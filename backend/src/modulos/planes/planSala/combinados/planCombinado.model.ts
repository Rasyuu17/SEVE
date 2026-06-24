import { DataTypes, Model } from 'sequelize';

import sequelize from '../../../../config/database';
import PlanSalaModel from '../planSala.model';

class PlanCombinadoModel extends Model {
  declare id: number;

  declare PlanSalaModels?: PlanSalaModel[];
}

PlanCombinadoModel.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
}, {
  sequelize,
  tableName: 'plan_combinado',
  timestamps: false,
});

PlanCombinadoModel.belongsToMany(PlanSalaModel, {
  through: 'plan_combinado_plan_sala',
  foreignKey: 'plan_combinado_id',
  otherKey: 'plan_sala_id',
});

export default PlanCombinadoModel;