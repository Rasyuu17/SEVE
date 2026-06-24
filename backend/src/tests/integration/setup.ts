// src/tests/integration/setup.ts
import sequelize from "../../config/database";
import { initTasa } from '../../helpers/initTasa';

jest.setTimeout(30000); // Dar tiempo suficiente

beforeEach(async () => {
    // Solo limpiar datos, NO recrear tablas
    // El sync({ force: true }) ya lo hace global-setup UNA vez
    await sequelize.truncate({ cascade: true, restartIdentity: true });
    await initTasa();
});

afterAll(async () => {
    await sequelize.close();
});