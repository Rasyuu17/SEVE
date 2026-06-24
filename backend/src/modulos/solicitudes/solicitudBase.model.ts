import { DataTypes, Model, Optional } from 'sequelize';

import sequelize from '../../config/database';
import DocumentoModel from './pdfDocs/pdfDocs.model';
import { SolicitudBaseType } from './solicitudBase.validator';

export type SolicitudBaseAttributes = SolicitudBaseType & {
  id: number;
  documento_id: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

export type SolicitudBaseCreationAttributes = Optional<SolicitudBaseAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class SolicitudBaseModel extends Model<SolicitudBaseAttributes, SolicitudBaseCreationAttributes> {
  declare id: number;
  declare fecha_inicio: Date;
  declare fecha_fin: Date;
  declare documento_id: number;
  declare estado: 'pendiente' | 'aceptado' | 'anulado' | 'cancelado' | 'por facturar' | 'facturado' | 'vencido' | 'causa mayor';
  declare confirmado: boolean;
  declare factura: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt?: Date;
}

SolicitudBaseModel.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  documento_id: {
    type: DataTypes.INTEGER,
    references: { model: DocumentoModel, key: 'id' },
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  fecha_fin: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'aceptado', 'anulado', 'cancelado', 'por facturar', 'facturado', 'vencido', 'causa mayor'),
    allowNull: false,
    defaultValue: 'pendiente',
  },
  confirmado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  factura: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'solicitud_base',
  timestamps: true,
  paranoid: true
});

SolicitudBaseModel.belongsTo(DocumentoModel, { foreignKey: 'documento_id' });

export default SolicitudBaseModel;