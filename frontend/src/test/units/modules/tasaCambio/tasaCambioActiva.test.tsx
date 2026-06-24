// src/test/units/modules/tasaCambio/tasaCambioActiva.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TasaActiva } from '../../../../tasaCambio/tasaCambioActiva';

const mockObtenerActiva = vi.fn();

vi.mock('../../../../tasaCambio/tasaCambio.client', () => ({
    tasaApi: {
        obtenerActiva: (...args: any[]) => mockObtenerActiva(...args),
    },
}));

describe('TasaActiva', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe mostrar loading inicialmente', () => {
        mockObtenerActiva.mockReturnValue(new Promise(() => {}));
        render(<TasaActiva />);
        expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('debe mostrar la tasa activa', async () => {
        mockObtenerActiva.mockResolvedValue({
            data: { tasa: 32000, createdAt: '2026-06-01T10:00:00Z' },
        });
        render(<TasaActiva />);
        await waitFor(() => {
            expect(screen.getByText('320.00')).toBeInTheDocument();
        });
    });

    it('debe mostrar mensaje sin tasa', async () => {
        mockObtenerActiva.mockResolvedValue({ data: null });
        render(<TasaActiva />);
        await waitFor(() => {
            expect(screen.getByText('No hay una tasa de cambio activa')).toBeInTheDocument();
        });
    });

    it('debe mostrar mensaje sin tasa si hay error', async () => {
        mockObtenerActiva.mockRejectedValue(new Error('Error'));
        render(<TasaActiva />);
        await waitFor(() => {
            expect(screen.getByText('No hay una tasa de cambio activa')).toBeInTheDocument();
        });
    });
});