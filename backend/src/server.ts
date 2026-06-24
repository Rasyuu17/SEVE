import app from './app';
import sequelize from './config/database';
import { initJobLimpieza } from './helpers/initJobLimpieza';
import { initTasa } from './helpers/initTasa';

const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');

    await initTasa();
    await initJobLimpieza();
    app.listen(PORT as number, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();