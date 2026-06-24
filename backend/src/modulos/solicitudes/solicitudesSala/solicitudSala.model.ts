import { DataTypes, Model, Optional } from 'sequelize';

import sequelize from '../../../config/database';
import PlanCombinadoModel from '../../planes/planSala/combinados/planCombinado.model';
import PlanSalaModel from '../../planes/planSala/planSala.model';
import SolicitudBaseModel from '../solicitudBase.model';
import { solicitudSalaSchema, SolicitudSalaType } from './solicitudSala.validator';

type SolicitudSalaAttributes = SolicitudSalaType & {
  id: number;
};

type SolicitudSalaCreationAttributes = Optional<SolicitudSalaAttributes, 'id' | 'id_planSala' | 'id_planCombinado'>;

class SolicitudSalaModel extends Model<SolicitudSalaAttributes, SolicitudSalaCreationAttributes> {
  declare id: number;
  declare id_planSala: number;
  declare id_planCombinado: number;
  declare link_vc: string;
  declare grabar: boolean;

  declare PlanCombinadoModel?: PlanCombinadoModel;
  declare PlanSalaModel?: PlanSalaModel;
  declare SolicitudBaseModel?: SolicitudBaseModel;

  static validate(data: SolicitudSalaType): SolicitudSalaType {
    return solicitudSalaSchema.parse(data);
  }
}

SolicitudSalaModel.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: SolicitudBaseModel, key: 'id' } },
  id_planSala: { type: DataTypes.INTEGER, references: { model: PlanSalaModel, key: 'id' }, allowNull: true },
  id_planCombinado: { type: DataTypes.INTEGER, references: { model: PlanCombinadoModel, key: 'id' }, allowNull: true },
  link_vc: { type: DataTypes.STRING, allowNull: false },
  grabar: {type: DataTypes.BOOLEAN,allowNull: false,defaultValue: false
}
}, {
  sequelize,
  timestamps: false,
  tableName: 'solicitud_sala',
});

SolicitudSalaModel.belongsTo(PlanSalaModel, { foreignKey: 'id_planSala' });
SolicitudSalaModel.belongsTo(PlanCombinadoModel, { foreignKey: 'id_planCombinado' });
SolicitudSalaModel.belongsTo(SolicitudBaseModel, { foreignKey: 'id' });

export default SolicitudSalaModel;