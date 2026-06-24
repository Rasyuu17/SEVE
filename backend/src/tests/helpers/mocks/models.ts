// src/tests/setup.ts
jest.mock('../../../config/database', () => ({
    __esModule: true,
    default: {
        transaction: jest.fn(),
        models: {},
        fn: jest.fn(),
        col: jest.fn(),
        literal: jest.fn(),
    },
}));

jest.mock('../../../modulos/solicitudes/solicitudesSala/solicitudSala.model', () => ({ __esModule: true, default: {} }));
jest.mock('../../../modulos/solicitudes/solicitudBase.model', () => ({ __esModule: true, default: {} }));
jest.mock('../../../modulos/planes/planSala/planSala.model', () => ({ __esModule: true, default: {} }));
jest.mock('../../../modulos/planes/planSala/sala/sala.model', () => ({ __esModule: true, default: {} }));
jest.mock('../../../modulos/planes/planSala/combinados/planCombinado.model', () => ({ __esModule: true, default: {} }));
jest.mock('../../../modulos/planes/planBase.model', () => ({ __esModule: true, default: {} }));
jest.mock('../../../modulos/tasaCambio/tasaCambio.model', () => ({ __esModule: true, default: {} }));
jest.mock('../../../modulos/solicitudes/pdfDocs/pdfDocs.model', () => ({ __esModule: true, default: {} }));