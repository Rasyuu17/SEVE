import { Sequelize } from 'sequelize';
const DAC = process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'development' ? {
  db_name: process.env.DB_NAME!,
  db_user: process.env.DB_USER!,
  db_password: process.env.DB_PASWORD!,
  db_host: process.env.DB_HOST
  } : {
  db_name: process.env.TEST_DB_NAME!,
  db_user: process.env.TEST_DB_USER!,
  db_password: process.env.TEST_DB_PASWORD!,
  db_host: process.env.TEST_DB_HOST
  }



const sequelize = new Sequelize(
  DAC.db_name,
  DAC.db_user,
  DAC.db_password,
  {
    host: DAC.db_host || 'localhost',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export default sequelize;