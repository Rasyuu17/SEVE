import { DataTypes, Model, Optional } from 'sequelize';

import sequelize from '../../../config/database';
import PlanBaseModel from '../planBase.model';
import SalaModel from './sala/sala.model';
import { planSalaSchema, PlanSalaType } from './planSala.validator';

type PlanSalaAttribute = PlanSalaType & {
  id: number;
};

type PlanSalaCreationAttribute = Optional<PlanSalaAttribute, 'id'>;

class PlanSalaModel extends Model<PlanSalaAttribute, PlanSalaCreationAttribute> {
  declare id: number;
  declare esIntegrable: boolean;
  declare esNacional: boolean;
  declare cantUsuariosLinea: number;
  declare cantUsuariosInvitados: number;
  declare tieneVCTodosPantalla: boolean;
  declare tieneVCReunionInteligente: boolean;
  declare tieneVCClaseVirtual: boolean;
  declare tieneVCRolesModerados: boolean;
  declare tieneColabEdicionAgenda: boolean;
  declare tieneColabRealizarLlamadas: boolean;
  declare tieneColabCrearConferencias: boolean;
  declare tieneColabCompartirPantalla: boolean;
  declare tieneColabControlRemoto: boolean;
  declare tieneColabPresentacion: boolean;
  declare tieneColabEnviarArchivos: boolean;
  declare tieneColabRecibirArchivos: boolean;
  declare tieneColabGrabacion: boolean;
  declare tiempoAlmacenamiento: number;
  declare almacenamientoLocal: boolean;

  declare PlanBaseModel?: PlanBaseModel;
  declare SalaModels?: SalaModel[];

  static validate(data: PlanSalaType): PlanSalaType {
    return planSalaSchema.parse(data);
  }
}

PlanSalaModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: PlanBaseModel, key: 'id' } },
    esIntegrable: { type: DataTypes.BOOLEAN, allowNull: false },
    esNacional: { type: DataTypes.BOOLEAN, allowNull: false },
    cantUsuariosLinea: { type: DataTypes.INTEGER, allowNull: false },
    cantUsuariosInvitados: { type: DataTypes.INTEGER, allowNull: false },
    tieneVCReunionInteligente: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    tieneVCTodosPantalla: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    tieneVCRolesModerados: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    tieneVCClaseVirtual: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    tieneColabEdicionAgenda: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    tieneColabRealizarLlamadas: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    tieneColabCrearConferencias: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    tieneColabCompartirPantalla: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    tieneColabControlRemoto: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    tieneColabPresentacion: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    tieneColabEnviarArchivos: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    tieneColabRecibirArchivos: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    tieneColabGrabacion: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    tiempoAlmacenamiento: { type: DataTypes.FLOAT, allowNull: false },
    almacenamientoLocal: { type: DataTypes.BOOLEAN, allowNull: false },
  }, {
    sequelize,
    tableName: 'plan_sala',
    timestamps: false,
  }
);

PlanSalaModel.belongsTo(PlanBaseModel, { foreignKey: 'id' });

PlanSalaModel.belongsToMany(SalaModel, {
  through: 'plan_sala_sala',
  foreignKey: 'plan_id',
  otherKey: 'sala_id',
  timestamps: false,
});
SalaModel.belongsToMany(PlanSalaModel, {
  through: 'plan_sala_sala',
  foreignKey: 'sala_id',
  otherKey: 'plan_id',
  as: 'planes',
  timestamps: false,
});

export default PlanSalaModel;