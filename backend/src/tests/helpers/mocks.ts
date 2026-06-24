// Mock de Sequelize antes que nada
jest.mock('../../config/database', () => {
    const { Sequelize } = require('sequelize');
    return new Sequelize('sqlite::memory:', { logging: false });
});