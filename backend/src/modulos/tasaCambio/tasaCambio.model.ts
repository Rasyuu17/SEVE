import { DataTypes, Model, CreationOptional, Optional } from 'sequelize';

import sequelize from '../../config/database';
import { tasaCambioSchema, TasaCambioType } from './tasaCambio.validator';

type TasaCambioAttributes = TasaCambioType & {
  id: CreationOptional<number>;
  createdAt?: CreationOptional<Date>;
  updatedAt?: CreationOptional<Date>;
  deletedAt?: CreationOptional<Date | null>;
};

type TasaCambioCreationAttributes = Optional<TasaCambioAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

class TasaCambioModel extends Model<TasaCambioAttributes, TasaCambioCreationAttributes> {
  declare id: CreationOptional<number>;
  declare tasa: number;
  declare createdAt?: CreationOptional<Date>;
  declare updatedAt?: CreationOptional<Date>;
  declare deletedAt?: CreationOptional<Date | null>;

  static validate(data: TasaCambioType): TasaCambioType {
    return tasaCambioSchema.parse(data);
  }
}

TasaCambioModel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tasa: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: 'tasa_cambio',
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        name: 'idx_deleted_at',
        fields: ['deletedAt'],
      },
    ],
  }
);

export default TasaCambioModel;