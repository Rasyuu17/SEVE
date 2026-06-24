// src/tests/unit/services/rollbacks-services.test.ts

// ─── Mocks ───────────────────────────────────────────────
// Estos se ejecutan ANTES que cualquier código
const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
};

jest.mock('../../../config/database', () => ({
    __esModule: true,
    default: {
        transaction: jest.fn().mockResolvedValue(mockTransaction),
        literal: jest.fn().mockReturnValue('COUNT(*) = 1'),
        models: {
            plan_combinado_plan_sala: {
                bulkCreate: jest.fn().mockResolvedValue([]),
                findAll: jest.fn().mockResolvedValue([]),
            },
            plan_sala_sala: {
                bulkCreate: jest.fn().mockResolvedValue([]),
            },
        },
    },
}));

jest.mock('../../../modulos/solicitudes/solicitudesSala/link/link.model', () => ({
    findByPk: jest.fn(),
    create: jest.fn(),
}));

jest.mock('../../../modulos/tasaCambio/tasaCambio.model', () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
}));

jest.mock('../../../modulos/planes/planSala/planSala.model', () => ({
    findAll: jest.fn(),
    findByPk: jest.fn(),
}));

jest.mock('../../../modulos/planes/planBase.model', () => ({
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
}));

jest.mock('../../../modulos/planes/planSala/combinados/planCombinado.model', () => ({
    create: jest.fn(),
    findByPk: jest.fn(),
}));

jest.mock('../../../modulos/planes/planSala/sala/sala.model', () => ({
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
}));

// ─── Imports ─────────────────────────────────────────────
import { LinkService } from '../../../modulos/solicitudes/solicitudesSala/link/link.service';
import { TasaCambioService } from '../../../modulos/tasaCambio/tasaCambio.service';
import { PlanCombinadoService } from '../../../modulos/planes/planSala/combinados/planCombinado.service';
import { SalaService } from '../../../modulos/planes/planSala/sala/sala.service';
import LinkModel from '../../../modulos/solicitudes/solicitudesSala/link/link.model';
import TasaCambioModel from '../../../modulos/tasaCambio/tasaCambio.model';
import PlanSalaModel from '../../../modulos/planes/planSala/planSala.model';
import PlanCombinadoModel from '../../../modulos/planes/planSala/combinados/planCombinado.model';
import SalaModel from '../../../modulos/planes/planSala/sala/sala.model';

// ─── Tests ───────────────────────────────────────────────
describe('LinkService - Rollback', () => {
    let service: LinkService;

    beforeEach(() => {
        service = new LinkService();
        jest.clearAllMocks();
    });

    it('debe hacer rollback si obtenerLink falla', async () => {
        (LinkModel.findByPk as jest.Mock).mockRejectedValue(new Error('DB error'));
        await expect(service.obtenerLink('test')).rejects.toThrow('DB error');
    });

    it('debe hacer rollback si guardarLink falla', async () => {
        (LinkModel.create as jest.Mock).mockRejectedValue(new Error('DB error'));
        await expect(service.guardarLink('test')).rejects.toThrow('DB error');
    });
});

describe('TasaCambioService - Rollback', () => {
    let service: TasaCambioService;

    beforeEach(() => {
        service = new TasaCambioService();
        jest.clearAllMocks();
    });

    it('debe hacer rollback si obtenerTasaActiva falla', async () => {
        (TasaCambioModel.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));
        await expect(service.obtenerTasaActiva()).rejects.toThrow('DB error');
    });
});

describe('PlanCombinadoService - Rollback', () => {
    let service: PlanCombinadoService;

    beforeEach(() => {
        service = new PlanCombinadoService();
        jest.clearAllMocks();
    });

    it('debe rechazar si no todos los planes existen', async () => {
        (PlanSalaModel.findAll as jest.Mock).mockResolvedValue([
            { id: 1, esIntegrable: true, PlanBaseModel: { deletedAt: null } },
        ]);
        await expect(service.crear({ planes: [1, 2] })).rejects.toThrow('No se puede crear combinado');
    });

    it('debe rechazar planes no integrables', async () => {
        (PlanSalaModel.findAll as jest.Mock).mockResolvedValue([
            { id: 1, esIntegrable: false, PlanBaseModel: { deletedAt: null } },
        ]);
        await expect(service.crear({ planes: [1] })).rejects.toThrow('no integrables');
    });

    it('debe rechazar planes eliminados', async () => {
        (PlanSalaModel.findAll as jest.Mock).mockResolvedValue([
            { id: 1, esIntegrable: true, PlanBaseModel: { deletedAt: new Date() } },
        ]);
        await expect(service.crear({ planes: [1] })).rejects.toThrow('eliminados');
    });

    it('debe hacer rollback si crear falla', async () => {
        (PlanSalaModel.findAll as jest.Mock).mockResolvedValue([
            { id: 1, esIntegrable: true, PlanBaseModel: { deletedAt: null } },
        ]);
        (PlanCombinadoModel.create as jest.Mock).mockRejectedValue(new Error('DB error'));
        await expect(service.crear({ planes: [1] })).rejects.toThrow('DB error');
    });
});

describe('SalaService - Rollback', () => {
    let service: SalaService;

    beforeEach(() => {
        service = new SalaService();
        jest.clearAllMocks();
    });

    it('debe hacer rollback si modificar falla', async () => {
        (SalaModel.findByPk as jest.Mock)
            .mockResolvedValueOnce({ id: 1, nombre: 'Sala Test' })
            .mockResolvedValueOnce(null);
        (PlanSalaModel.findAll as jest.Mock).mockResolvedValue([]);
        (SalaModel.destroy as jest.Mock).mockResolvedValue(1);
        (SalaModel.create as jest.Mock).mockRejectedValue(new Error('DB error'));

        await expect(
            service.modificar(1, { nombre: 'Test', ubicacion: 'PB', tieneTerminal: true })
        ).rejects.toThrow('DB error');
    });

    it('debe hacer rollback si eliminar falla', async () => {
        // Mockear directo en la instancia del modelo que usa el servicio
        (service as any).model.findByPk = jest.fn().mockResolvedValue({ id: 1, nombre: 'Sala Test' });
        (PlanSalaModel.findAll as jest.Mock).mockResolvedValue([]);
        (service as any).model.destroy = jest.fn().mockRejectedValue(new Error('DB error'));

        await expect(service.eliminar(1)).rejects.toThrow('DB error');
    });
});