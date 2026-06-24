import { DataTypes, Model } from 'sequelize';

import sequelize from '../../../config/database';

type DocumentoAttributes = {
  id: number;
  numero: number;
  direccion_original: string;
  direccion_firmado: string;
  id_contratoGeneral: number;
  id_contratoEspecifico: number;
  nombre_solicitante: string;
  entidad: string;
  correo: string;
  tipo: string;
  estado: string;
  createdAt?: Date
};

type DocumentoCreationAttributes = Omit<DocumentoAttributes, 'id' | 'createdAt' | 'updatedAt' | 'direccion_firmado'>;

class DocumentoModel extends Model<DocumentoAttributes, DocumentoCreationAttributes> {
  declare id: number;
  declare numero: number;
  declare direccion_original: string;
  declare direccion_firmado: string;
  declare id_contratoGeneral: number;
  declare id_contratoEspecifico: number;
  declare nombre_solicitante: string;
  declare entidad: string;
  declare correo: string;
  declare tipo: string;
  declare estado: string;
  declare createdAt: Date;
}

DocumentoModel.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  numero: { type: DataTypes.INTEGER },
  direccion_original: { type: DataTypes.STRING, allowNull: true },
  direccion_firmado: { type: DataTypes.STRING, allowNull: true },
  id_contratoGeneral: { type: DataTypes.INTEGER },
  id_contratoEspecifico: { type: DataTypes.INTEGER },
  nombre_solicitante: { type: DataTypes.STRING },
  entidad: { type: DataTypes.STRING },
  correo: { type: DataTypes.STRING },
  tipo: { type: DataTypes.ENUM('solicitud_sala') },
  estado: {type: DataTypes.ENUM('necesita confirmacion', 'confirmado', 'terminado')}
}, {
  sequelize,
  timestamps: true,
  paranoid: true,
  tableName: 'documento',
});

export default DocumentoModel;