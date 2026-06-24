// src/test/units/modules/cambioTarifas/cambioTarifas.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CambiosTarifasPage from '../../../../cambioTarifas/cambioTarifas.page';

const mockObtenerActiva = vi.fn();
const mockListar = vi.fn();
const mockAplicarCambios = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../../../tasaCambio/tasaCambio.client', () => ({
    tasaApi: {
        obtenerActiva: (...args: any[]) => mockObtenerActiva(...args),
        aplicarCambios: (...args: any[]) => mockAplicarCambios(...args),
    },
}));

vi.mock('../../../../planes/planSala/planSala.client', () => ({
    planApi: {
        listar: (...args: any[]) => mockListar(...args),
    },
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

const tasaMock = { id: 1, tasa: 32000 }; // 320.00 en centavos

const planesMock = [
    { id: 1, PlanBaseModel: { id: 1, nombre: 'Plan A', tarifa: 45000, categoriaAnexable: 'sala' } },
    { id: 2, PlanBaseModel: { id: 2, nombre: 'Plan B', tarifa: 60000, categoriaAnexable: 'sala' } },
];

describe('CambiosTarifasPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockObtenerActiva.mockResolvedValue({ data: tasaMock });
        mockListar.mockResolvedValue({ data: planesMock });
        mockAplicarCambios.mockResolvedValue({ data: { success: true } });
    });

    it('debe mostrar loading inicialmente', async () => {
            render(<CambiosTarifasPage />);
            expect(screen.getByText('Cargando...')).toBeInTheDocument();
            await waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument());
    });

    it('debe mostrar tasa actual', async () => {
        render(<CambiosTarifasPage />);
        await waitFor(() => {
            expect(screen.getByText('320.00')).toBeInTheDocument();
        });
    });

    it('debe mostrar lista de planes', async () => {
        render(<CambiosTarifasPage />);
        await waitFor(() => {
            expect(screen.getByText('Plan A')).toBeInTheDocument();
            expect(screen.getByText('Plan B')).toBeInTheDocument();
        });
    });

    it('debe mostrar tarifas en CUP', async () => {
        render(<CambiosTarifasPage />);
        await waitFor(() => {
            expect(screen.getByText('$450.00')).toBeInTheDocument();
            expect(screen.getByText('$600.00')).toBeInTheDocument();
        });
    });

    it('debe permitir ingresar nueva tasa', async () => {
        render(<CambiosTarifasPage />);
        await waitFor(() => expect(screen.getByText('Plan A')).toBeInTheDocument());

        const inputTasa = screen.getByPlaceholderText('Nueva tasa (ej: 325.50)');
        await userEvent.type(inputTasa, '350');
        expect(inputTasa).toHaveValue(350);
    });

    it('debe permitir ingresar nueva tarifa para un plan', async () => {
        render(<CambiosTarifasPage />);
        await waitFor(() => expect(screen.getByText('Plan A')).toBeInTheDocument());

        const inputs = screen.getAllByPlaceholderText('Sin cambio');
        await userEvent.type(inputs[0], '500');
        expect(inputs[0]).toHaveValue(500);
    });

    it('debe mostrar error si no hay cambios', async () => {
        render(<CambiosTarifasPage />);
        await waitFor(() => expect(screen.getByText('Plan A')).toBeInTheDocument());

        await userEvent.click(screen.getByText('Aplicar Cambios'));

        await waitFor(() => {
            // toast.error no se ve en el DOM, pero el submit no llama a aplicarCambios
            expect(mockAplicarCambios).not.toHaveBeenCalled();
        });
    });

    it('debe llamar aplicarCambios con datos correctos', async () => {
        render(<CambiosTarifasPage />);
        await waitFor(() => expect(screen.getByText('Plan A')).toBeInTheDocument());

        const inputTasa = screen.getByPlaceholderText('Nueva tasa (ej: 325.50)');
        await userEvent.type(inputTasa, '350');

        const inputs = screen.getAllByPlaceholderText('Sin cambio');
        await userEvent.type(inputs[0], '500');

        await userEvent.click(screen.getByText('Aplicar Cambios'));

        await waitFor(() => {
            expect(mockAplicarCambios).toHaveBeenCalledWith({
                nuevaTasa: 35000, // 350 * 100 centavos
                cambios: [
                    { planId: 1, tipo: 'sala', nuevaTarifa: 50000 },
                ],
            });
        });
    });

    it('debe navegar a /documentos tras éxito', async () => {
        mockAplicarCambios.mockResolvedValue({ data: { success: true } });
        render(<CambiosTarifasPage />);
        await waitFor(() => expect(screen.getByText('Plan A')).toBeInTheDocument());

        await userEvent.type(screen.getByPlaceholderText('Nueva tasa (ej: 325.50)'), '350');
        await userEvent.click(screen.getByText('Aplicar Cambios'));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/documentos');
        });
    });

    it('debe navegar atrás al cancelar', async () => {
        render(<CambiosTarifasPage />);
        await waitFor(() => expect(screen.getByText('Plan A')).toBeInTheDocument());

        await userEvent.click(screen.getByText('Cancelar'));
        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
});