import sequelize from '../../config/database';

export default async () => {
    await sequelize.close();
};