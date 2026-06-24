import { CreationOptional, DataTypes, Model, Optional } from 'sequelize';

import sequelize from '../../config/database';
import TasaCambioModel from '../tasaCambio/tasaCambio.model';
import { planBaseSchema, PlanBaseType } from './planBase.validator';

export type PlanBaseAttributes = PlanBaseType & {
  id: CreationOptional<number>;
  tasa_fk: number;
  createdAt?: CreationOptional<Date>;
  updatedAt?: CreationOptional<Date>;
  deletedAt?: CreationOptional<Date | null>;
};

type PlanBaseCreationAttributes = Optional<PlanBaseAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

class PlanBaseModel extends Model<PlanBaseAttributes, PlanBaseCreationAttributes> {
  declare id: CreationOptional<number>;
  declare tasa_fk: number;
  declare nombre: string;
  declare normalizacionTiempo: 'hora' | 'dia' | 'mes';
  declare tarifa: number;
  declare categoriaAnexable: 'sala' | 'autogestionado y eventos' | 'valor agregado';
  declare createdAt?: CreationOptional<Date>;
  declare updatedAt?: CreationOptional<Date>;
  declare deletedAt?: CreationOptional<Date | null>;

  declare TasaCambioModel?: TasaCambioModel;

  static validate(data: PlanBaseType): PlanBaseType {
    return planBaseSchema.parse(data);
  }
}

PlanBaseModel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tasa_fk: { type: DataTypes.INTEGER, allowNull: false, references: { model: TasaCambioModel, key: 'id' } },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    normalizacionTiempo: { type: DataTypes.ENUM('hora', 'dia', 'mes'), allowNull: false },
    tarifa: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    categoriaAnexable: { type: DataTypes.ENUM('sala', 'autogestionado y eventos', 'valor agregado'), allowNull: false },
  },
  {
    sequelize,
    tableName: 'plan_base',
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        name: 'idx_plan_base_deleted_at',
        fields: ['deletedAt'],
      },
    ],
  }
);

PlanBaseModel.belongsTo(TasaCambioModel, { foreignKey: 'tasa_fk' });

export default PlanBaseModel;