// src/test/units/modules/planSala/planSalaForm.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlanSalaForm } from '../../../../planes/planSala/planSalaForm';

import { configure } from '@testing-library/dom';

configure({
    getElementError: (message) => new Error(message as any),
});

const mockCrearSala = vi.fn();
const mockModificar = vi.fn();
const mockListarDisponibles = vi.fn();
const mockObtenerPorPlan = vi.fn();

vi.mock('../../../../planes/planSala/planSala.client', () => ({
    planApi: {
        crearSala: (...args: any[]) => mockCrearSala(...args),
        modificar: (...args: any[]) => mockModificar(...args),
        listar: vi.fn(),
        obtenerPorId: vi.fn(),
        eliminar: vi.fn(),
    },
}));

vi.mock('../../../../planes/planSala/sala/sala.client', () => ({
    salaApi: {
        listarDisponibles: (...args: any[]) => mockListarDisponibles(...args),
        obtenerPorPlan: (...args: any[]) => mockObtenerPorPlan(...args),
    },
}));

// Helpers para obtener inputs por su label (sin htmlFor)
const getInputByLabel = (labelText: string): HTMLInputElement => {
    const label = screen.getByText(labelText);
    const container = label.closest('div') || label.parentElement;
    return container?.querySelector('input, select') as HTMLInputElement;
};

const typeInField = async (labelText: string, value: string) => {
    const input = getInputByLabel(labelText);
    if (input.tagName === 'SELECT') {
        await userEvent.selectOptions(input, value);
    } else {
        await userEvent.clear(input);
        await userEvent.type(input, value);
    }
};

describe('PlanSalaForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockListarDisponibles.mockResolvedValue({ data: [] });
        mockObtenerPorPlan.mockResolvedValue({ data: [] });
    });

    const waitForHeading = (text: string) =>
        waitFor(() => expect(screen.getByRole('heading', { name: text })).toBeInTheDocument());

    const clickSubmit = (text: string) =>
        userEvent.click(screen.getByRole('button', { name: text }));

    // ─── Renderizado ──────────────────────────────────
    it('debe mostrar título Crear Plan Sala', async () => {
        render(<PlanSalaForm />);
        await waitForHeading('Crear Plan Sala');
    });

    it('debe mostrar título Editar Plan Sala con initialData', async () => {
        render(<PlanSalaForm initialData={initialDataMock()} />);
        await waitForHeading('Editar Plan Sala');
    });

    it('debe mostrar botón Cancelar si onCancel existe', async () => {
        render(<PlanSalaForm onCancel={() => {}} />);
        await waitFor(() => expect(screen.getByText('Cancelar')).toBeInTheDocument());
    });

    // ─── Validaciones ─────────────────────────────────
    it('debe mostrar error con nombre muy corto', async () => {
        render(<PlanSalaForm />);
        await waitForHeading('Crear Plan Sala');
        await typeInField('Nombre', 'ab');
        await clickSubmit('Crear Plan Sala');
        await waitFor(() => expect(screen.getByText('El nombre debe tener al menos 3 caracteres')).toBeInTheDocument());
    });

    it('debe mostrar error con tarifa negativa', async () => {
        render(<PlanSalaForm />);
        await waitForHeading('Crear Plan Sala');
        await typeInField('Tarifa', '-1');
        await clickSubmit('Crear Plan Sala');
        await waitFor(() => expect(screen.getByText('La tarifa debe ser positiva')).toBeInTheDocument());
    });

    it('debe mostrar error con cantUsuariosLinea menor a 1', async () => {
        render(<PlanSalaForm />);
        await waitForHeading('Crear Plan Sala');
        await typeInField('Nombre', 'Plan Test');
        await typeInField('Tarifa', '450');
        await typeInField('Usuarios en Línea', '0');
        await clickSubmit('Crear Plan Sala');
        await waitFor(() => expect(screen.getByText('Debe haber al menos 1 usuario en línea')).toBeInTheDocument());
    });

    it('debe mostrar error con cantUsuariosInvitados menor a 1', async () => {
        render(<PlanSalaForm />);
        await waitForHeading('Crear Plan Sala');
        await typeInField('Nombre', 'Plan Test');
        await typeInField('Tarifa', '450');
        await typeInField('Usuarios Invitados', '0');
        await clickSubmit('Crear Plan Sala');
        await waitFor(() => expect(screen.getByText('Debe haber al menos 1 usuario invitado')).toBeInTheDocument());
    });

    it('debe mostrar error con tiempoAlmacenamiento negativo', async () => {
        render(<PlanSalaForm />);
        await waitForHeading('Crear Plan Sala');
        await typeInField('Nombre', 'Plan Test');
        await typeInField('Tarifa', '450');
        await typeInField('Tiempo Almacenamiento (días)', '-1');
        await clickSubmit('Crear Plan Sala');
        await waitFor(() => expect(screen.getByText('El tiempo no puede ser negativo')).toBeInTheDocument());
    });

    // ─── Submit ───────────────────────────────────────
    it('debe crear plan exitosamente', async () => {
        mockCrearSala.mockResolvedValue({ data: { id: 1 } });
        render(<PlanSalaForm />);
        await waitForHeading('Crear Plan Sala');
        await typeInField('Nombre', 'Plan Test');
        await typeInField('Tarifa', '450');
        await typeInField('Usuarios en Línea', '10');
        await typeInField('Usuarios Invitados', '10');
        await clickSubmit('Crear Plan Sala');
        await waitFor(() => expect(mockCrearSala).toHaveBeenCalled());
    });

    it('debe editar plan exitosamente', async () => {
        mockModificar.mockResolvedValue({ data: { id: 1 } });
        render(<PlanSalaForm initialData={initialDataMock()} />);
        await waitForHeading('Editar Plan Sala');
        await clickSubmit('Actualizar Plan');
        await waitFor(() => expect(mockModificar).toHaveBeenCalled());
    });

    it('debe mostrar "Guardando..." mientras se envía', async () => {
        mockCrearSala.mockReturnValue(new Promise(() => {}));
        render(<PlanSalaForm />);
        await waitForHeading('Crear Plan Sala');
        await typeInField('Nombre', 'Plan Test');
        await typeInField('Tarifa', '450');
        await typeInField('Usuarios en Línea', '10');
        await typeInField('Usuarios Invitados', '10');
        await clickSubmit('Crear Plan Sala');
        await waitFor(() => expect(screen.getByText('Guardando...')).toBeInTheDocument());
    });
    // ─── Cancelar ─────────────────────────────────────
    it('debe llamar onCancel al hacer clic en Cancelar', async () => {
        const onCancel = vi.fn();
        render(<PlanSalaForm onCancel={onCancel} />);
        await waitFor(() => expect(screen.getByText('Cancelar')).toBeInTheDocument());
        await userEvent.click(screen.getByText('Cancelar'));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    // ─── Salas ────────────────────────────────────────
    it('debe mostrar "No hay salas disponibles" sin salas', async () => {
        mockListarDisponibles.mockResolvedValue({ data: [] });
        render(<PlanSalaForm />);
        await waitFor(() => expect(screen.getByText('No hay salas disponibles')).toBeInTheDocument());
    });

    it('debe mostrar salas disponibles para seleccionar', async () => {
        mockListarDisponibles.mockResolvedValue({
            data: [
                { id: 1, nombre: 'Sala A', ubicacion: 'Piso 1' },
                { id: 2, nombre: 'Sala B', ubicacion: 'Piso 2' },
            ],
        });
        render(<PlanSalaForm />);
        await waitFor(() => {
            expect(screen.getByText('Sala A - Piso 1')).toBeInTheDocument();
            expect(screen.getByText('Sala B - Piso 2')).toBeInTheDocument();
        });
    });

    // ─── Edición ──────────────────────────────────────
    it('debe deshabilitar nombre y tarifa en modo edición', async () => {
        render(<PlanSalaForm initialData={initialDataMock()} />);
        await waitForHeading('Editar Plan Sala');
        expect(getInputByLabel('Nombre').disabled).toBe(true);
        expect(getInputByLabel('Tarifa').disabled).toBe(true);
    });
});

// Mock de initialData reutilizable
const initialDataMock = (): any => ({
    id: 1, nombre: 'Plan Viejo', tarifa: 45000,
    normalizacionTiempo: 'mes', categoriaAnexable: 'sala',
    esIntegrable: true, esNacional: true,
    cantUsuariosLinea: 10, cantUsuariosInvitados: 10,
    tieneVCReunionInteligente: false, tieneVCTodosPantalla: false,
    tieneVCRolesModerados: false, tieneVCClaseVirtual: false,
    tieneColabEdicionAgenda: false, tieneColabRealizarLlamadas: false,
    tieneColabCrearConferencias: false, tieneColabCompartirPantalla: false,
    tieneColabControlRemoto: false, tieneColabPresentacion: false,
    tieneColabEnviarArchivos: false, tieneColabRecibirArchivos: false,
    tieneColabGrabacion: false, tiempoAlmacenamiento: 30,
    almacenamientoLocal: false, extras: { salas_ids: [] },
});