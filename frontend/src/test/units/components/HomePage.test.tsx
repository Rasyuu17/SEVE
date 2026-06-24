// src/test/units/pages/HomePage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../../../HomePage';

const mockListar = vi.fn();

vi.mock('../../../planes/planSala/planSala.client', () => ({
    planApi: {
        listar: (...args: any[]) => mockListar(...args),
    },
}));

vi.mock('../../../tasaCambio/tasaCambioActiva', () => ({
    TasaActiva: () => <div>Tasa de Cambio Activa</div>,
}));

const renderHome = () => {
    return render(
        <MemoryRouter>
            <HomePage />
        </MemoryRouter>
    );
};

describe('HomePage', () => {
    it('debe mostrar el título principal', () => {
        mockListar.mockResolvedValue({ data: [] });
        renderHome();
        expect(screen.getByText('Sistema de Gestión de Servicios de Videoconferencia')).toBeInTheDocument();
    });

    it('debe mostrar el componente TasaActiva', async () => {
        mockListar.mockResolvedValue({ data: [] });
        renderHome();
        await waitFor(() => {
            expect(screen.getByText('Tasa de Cambio Activa')).toBeInTheDocument();
        });
    });

    it('debe mostrar la cantidad de planes activos', async () => {
        mockListar.mockResolvedValue({ data: [{ id: 1 }, { id: 2 }, { id: 3 }] });
        renderHome();
        await waitFor(() => {
            expect(screen.getByText('3')).toBeInTheDocument();
        });
    });

    it('debe mostrar 0 si no hay planes', async () => {
        mockListar.mockResolvedValue({ data: [] });
        renderHome();
        await waitFor(() => {
            expect(screen.getByText('0')).toBeInTheDocument();
        });
    });

    it('debe mostrar enlaces a las secciones', () => {
        mockListar.mockResolvedValue({ data: [] });
        renderHome();
        expect(screen.getByText('Catálogo de Planes')).toBeInTheDocument();
        expect(screen.getByText('Documentos')).toBeInTheDocument();
        expect(screen.getByText('Cambios de Tarifas')).toBeInTheDocument();
    });
});