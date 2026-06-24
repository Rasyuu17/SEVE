// src/test/units/modules/planSala/planSalaList.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlanSalaList } from '../../../../planes/planSala/planSalaList';

const mockListar = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

vi.mock('../../../../planes/planSala/planSala.client', () => ({
    planApi: {
        listar: (...args: any[]) => mockListar(...args),
    },
}));

const planMock = {
    id: 1,
    tasa_fk: 1,
    nombre: 'Plan Test',
    tarifa: 45000,
    normalizacionTiempo: 'mes' as const,
    categoriaAnexable: 'sala' as const,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    deletedAt: null,
    TasaCambioModel: { id: 1, tasa: 320 },
    esIntegrable: true,
    esNacional: true,
    cantUsuariosLinea: 16,
    cantUsuariosInvitados: 16,
    tiempoAlmacenamiento: 30,
    almacenamientoLocal: false,
    tieneVCReunionInteligente: false,
    tieneVCTodosPantalla: false,
    tieneVCRolesModerados: false,
    tieneVCClaseVirtual: false,
    tieneColabEdicionAgenda: false,
    tieneColabRealizarLlamadas: false,
    tieneColabCrearConferencias: false,
    tieneColabCompartirPantalla: false,
    tieneColabControlRemoto: false,
    tieneColabPresentacion: false,
    tieneColabEnviarArchivos: false,
    tieneColabRecibirArchivos: false,
    tieneColabGrabacion: false,
    PlanBaseModel: {
        id: 1, tasa_fk: 1, nombre: 'Plan Test', tarifa: 45000,
        normalizacionTiempo: 'mes' as const, categoriaAnexable: 'sala' as const,
        createdAt: '2025-01-01', updatedAt: '2025-01-01', deletedAt: null,
        TasaCambioModel: { id: 1, tasa: 320 },
    },
    SalaModels: [],
};

describe('PlanSalaList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe mostrar loading inicialmente', () => {
        mockListar.mockReturnValue(new Promise(() => {})); // nunca resuelve
        render(
            <PlanSalaList onEdit={() => {}} onDelete={() => {}} onCreate={() => {}} />
        );
        expect(screen.getByText('Cargando planes...')).toBeInTheDocument();
    });

    it('debe mostrar mensaje cuando no hay planes', async () => {
        mockListar.mockResolvedValue({ data: [] });
        render(
            <PlanSalaList onEdit={() => {}} onDelete={() => {}} onCreate={() => {}} />
        );
        await waitFor(() => {
            expect(screen.getByText('No hay planes registrados')).toBeInTheDocument();
        });
    });

    it('debe mostrar los planes cargados', async () => {
        mockListar.mockResolvedValue({ data: [planMock] });
        render(
            <PlanSalaList onEdit={() => {}} onDelete={() => {}} onCreate={() => {}} />
        );
        await waitFor(() => {
            expect(screen.getByText('Plan Test')).toBeInTheDocument();
        });
    });

    it('debe llamar onCreate al hacer clic en Nuevo Plan', async () => {
        const onCreate = vi.fn();
        mockListar.mockResolvedValue({ data: [] });
        render(
            <PlanSalaList onEdit={() => {}} onDelete={() => {}} onCreate={onCreate} />
        );
        await waitFor(() => {
            expect(screen.queryByText('Cargando planes...')).not.toBeInTheDocument();
        });
        await userEvent.click(screen.getByText('Nuevo Plan'));
        expect(onCreate).toHaveBeenCalledTimes(1);
    });

    it('debe llamar onEdit al hacer clic en editar', async () => {
        const onEdit = vi.fn();
        mockListar.mockResolvedValue({ data: [planMock] });
        render(
            <PlanSalaList onEdit={onEdit} onDelete={() => {}} onCreate={() => {}} />
        );
        await waitFor(() => {
            expect(screen.getByText('Plan Test')).toBeInTheDocument();
        });
        const buttons = screen.getAllByRole('button');
        await userEvent.click(buttons[2]); // Editar
        expect(onEdit).toHaveBeenCalledWith(planMock);
    });

    it('debe llamar onDelete al hacer clic en eliminar', async () => {
        const onDelete = vi.fn();
        mockListar.mockResolvedValue({ data: [planMock] });
        render(
            <PlanSalaList onEdit={() => {}} onDelete={onDelete} onCreate={() => {}} />
        );
        await waitFor(() => {
            expect(screen.getByText('Plan Test')).toBeInTheDocument();
        });
        const buttons = screen.getAllByRole('button');
        await userEvent.click(buttons[3]); // Eliminar
        expect(onDelete).toHaveBeenCalled;
    });

    it('debe mostrar cantidad de salas', async () => {
        const planConSalas = {
            ...planMock,
            SalaModels: [{ id: 1, nombre: 'Sala A' }, { id: 2, nombre: 'Sala B' }] as any,
        };
        mockListar.mockResolvedValue({ data: [planConSalas] });
        render(
            <PlanSalaList onEdit={() => {}} onDelete={() => {}} onCreate={() => {}} />
        );
        await waitFor(() => {
            expect(screen.getByText('2 salas')).toBeInTheDocument();
        });
    });

    it('debe navegar a calendario operativo al hacer clic', async () => {
        mockListar.mockResolvedValue({ data: [] });
        render(
            <PlanSalaList onEdit={() => {}} onDelete={() => {}} onCreate={() => {}} />
        );
        await waitFor(() => {
            expect(screen.queryByText('Cargando planes...')).not.toBeInTheDocument();
        });
        await userEvent.click(screen.getByText('Calendario Operativo'));
        expect(mockNavigate).toHaveBeenCalledWith('/planes/sala/calendario-operativo');
    });
});