import { DataTypes, Model } from 'sequelize';

import sequelize from '../../../../config/database';

type LinkAttributes = {
  link: string;
};

class LinkModel extends Model<LinkAttributes> {
  declare link: string;
}

LinkModel.init({
  link: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
}, {
  sequelize,
  tableName: 'link_vc',
  timestamps: false,
});

export default LinkModel;