import { CreationOptional, DataTypes, Model, Optional } from 'sequelize';

import sequelize from '../../../../config/database';
import { SalaType } from './sala.validator';

type SalaAttributes = SalaType & {
  id: number;
  createdAt?: CreationOptional<Date>;
  updatedAt?: CreationOptional<Date>;
  deletedAt?: CreationOptional<Date | null>;
};

type SalaCreationAttributes = Optional<SalaAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

class SalaModel extends Model<SalaAttributes, SalaCreationAttributes> {
  declare id: number;
  declare nombre: string;
  declare tieneTerminal: boolean;
  declare ubicacion: string;
  declare createdAt?: CreationOptional<Date>;
  declare updatedAt?: CreationOptional<Date>;
  declare deletedAt?: CreationOptional<Date | null>;
}

SalaModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    tieneTerminal: { type: DataTypes.BOOLEAN, allowNull: false },
    ubicacion: { type: DataTypes.STRING, allowNull: false },
  }, {
    sequelize,
    tableName: 'sala',
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        name: 'idx_sala_deleted_at',
        fields: ['deletedAt'],
      },
    ],
  }
);

export default SalaModel;