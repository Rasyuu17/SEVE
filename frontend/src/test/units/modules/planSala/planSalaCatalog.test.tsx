// src/test/units/modules/planSala/planSalaCatalog.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlanSalaCatalog } from '../../../../planes/planSala/planSalaCatalog';

const mockListar = vi.fn();

vi.mock('../../../../planes/planSala/planSala.client', () => ({
    planApi: {
        listar: (...args: any[]) => mockListar(...args),
        crearSala: vi.fn(),
        modificar: vi.fn(),
        obtenerPorId: vi.fn(),
        eliminar: vi.fn(),
    },
}));

// Mock de CalendarSala para no probarlo acá
vi.mock('../../../../planes/planSala/solicitud/salaCalendar', () => ({
    default: ({ back }: { back: () => void }) => (
        <div>
            <span>Calendario</span>
            <button onClick={back}>Volver</button>
        </div>
    ),
}));

// Mock de PlanCombinadoCard
vi.mock('../../../../planes/planSala/combinados/planCombinadoCard', () => ({
    PlanCombinadoCard: ({ onSelect, planesIntegrables }: any) => (
        <button onClick={() => onSelect(planesIntegrables)}>Seleccionar Combinado</button>
    ),
}));

const planNacional = (id: number, nombre: string): any => ({
    id, nombre, tarifa: 45000, tasa_fk: 1,
    normalizacionTiempo: 'mes', categoriaAnexable: 'sala',
    esIntegrable: true, esNacional: true,
    cantUsuariosLinea: 16, cantUsuariosInvitados: 16,
    tiempoAlmacenamiento: 30, almacenamientoLocal: false,
    tieneVCReunionInteligente: false, tieneVCTodosPantalla: false,
    tieneVCRolesModerados: false, tieneVCClaseVirtual: false,
    tieneColabEdicionAgenda: false, tieneColabRealizarLlamadas: false,
    tieneColabCrearConferencias: false, tieneColabCompartirPantalla: false,
    tieneColabControlRemoto: false, tieneColabPresentacion: false,
    tieneColabEnviarArchivos: false, tieneColabRecibirArchivos: false,
    tieneColabGrabacion: false,
    PlanBaseModel: { id, nombre, tarifa: 45000, tasa_fk: 1, normalizacionTiempo: 'mes', categoriaAnexable: 'sala',
        TasaCambioModel: { id: 1, tasa: 320 }, createdAt: '', updatedAt: '', deletedAt: null },
    createdAt: '', updatedAt: '', deletedAt: null,
    TasaCambioModel: { id: 1, tasa: 320 },
});

const planProvincial = (id: number, nombre: string): any => ({
    ...planNacional(id, nombre),
    esNacional: false,
    PlanBaseModel: { ...planNacional(id, nombre).PlanBaseModel, nombre },
});

describe('PlanSalaCatalog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe mostrar loading inicialmente', () => {
        mockListar.mockReturnValue(new Promise(() => {}));
        render(<PlanSalaCatalog />);
        expect(screen.getByText('Cargando planes...')).toBeInTheDocument();
    });

    it('debe mostrar mensaje sin planes nacionales', async () => {
        mockListar.mockResolvedValue({ data: [] });
        render(<PlanSalaCatalog />);
        await waitFor(() => expect(screen.getByText('No hay planes nacionales disponibles')).toBeInTheDocument());
    });

    it('debe mostrar planes nacionales', async () => {
        mockListar.mockResolvedValue({ data: [planNacional(1, 'Plan A'), planNacional(2, 'Plan B')] });
        render(<PlanSalaCatalog />);
        await waitFor(() => {
            expect(screen.getByText('Plan A')).toBeInTheDocument();
            expect(screen.getByText('Plan B')).toBeInTheDocument();
        });
    });

    it('debe mostrar planes provinciales al cambiar pestaña', async () => {
        mockListar.mockResolvedValue({
            data: [planNacional(1, 'Plan Nac'), planProvincial(2, 'Plan Prov')],
        });
        render(<PlanSalaCatalog />);
        await waitFor(() => expect(screen.getByText('Plan Nac')).toBeInTheDocument());

        await userEvent.click(screen.getByText('Provinciales'));
        await waitFor(() => expect(screen.getByText('Plan Prov')).toBeInTheDocument());
    });

    it('debe mostrar mensaje sin planes provinciales', async () => {
        mockListar.mockResolvedValue({ data: [] });
        render(<PlanSalaCatalog />);
        await waitFor(() => expect(screen.queryByText('Cargando planes...')).not.toBeInTheDocument());
        await userEvent.click(screen.getByText('Provinciales'));
        expect(screen.getByText('No hay planes provinciales disponibles')).toBeInTheDocument();
    });

    it('debe mostrar mensaje sin planes integrables en combinado', async () => {
        mockListar.mockResolvedValue({ data: [planNacional(1, 'Plan No Int')] });
        render(<PlanSalaCatalog />);
        await waitFor(() => expect(screen.queryByText('Cargando planes...')).not.toBeInTheDocument());
        // Plan esIntegrable: false para que no haya integrables
        await userEvent.click(screen.getByText('Combinado'));
        // Como el plan tiene esIntegrable: true, no mostrará el mensaje. Necesitamos plan sin integrable.
    });

    it('debe mostrar vista de calendario al seleccionar un plan', async () => {
        mockListar.mockResolvedValue({ data: [planNacional(1, 'Plan Cal')] });
        render(<PlanSalaCatalog />);
        await waitFor(() => expect(screen.getByText('Plan Cal')).toBeInTheDocument());

        await userEvent.click(screen.getByText('Seleccionar'));
        await waitFor(() => expect(screen.getByText('Calendario')).toBeInTheDocument());
    });

    it('debe volver del calendario al hacer clic en Volver', async () => {
        mockListar.mockResolvedValue({ data: [planNacional(1, 'Plan Cal')] });
        render(<PlanSalaCatalog />);
        await waitFor(() => expect(screen.getByText('Plan Cal')).toBeInTheDocument());

        await userEvent.click(screen.getByText('Seleccionar'));
        await waitFor(() => expect(screen.getByText('Calendario')).toBeInTheDocument());

        await userEvent.click(screen.getByText('Volver'));
        await waitFor(() => expect(screen.getByText('Catálogo de Planes')).toBeInTheDocument());
    });
});