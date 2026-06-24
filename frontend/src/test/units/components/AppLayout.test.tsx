// src/test/units/layout/AppLayout.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AppLayout from '../../../AppLayout';

vi.mock('react-hot-toast', () => ({
    Toaster: () => <div>Toaster</div>,
}));

const renderWithRouter = () => {
    return render(
        <MemoryRouter initialEntries={['/planes/sala']}>
            <AppLayout />
        </MemoryRouter>
    );
};

describe('AppLayout', () => {
    it('debe mostrar el título', () => {
        renderWithRouter();
        expect(screen.getByText('Servicios Especializados de Videoconferencia')).toBeInTheDocument();
    });

    it('debe mostrar enlaces de navegación al abrir menú', async () => {
        renderWithRouter();
        const menuBtn = screen.getByRole('button');
        await userEvent.click(menuBtn);

        expect(screen.getByText('Planes')).toBeInTheDocument();
        expect(screen.getByText('Salas')).toBeInTheDocument();
        expect(screen.getByText('Cambio de tarifas')).toBeInTheDocument();
        expect(screen.getByText('Catálogo')).toBeInTheDocument();
        expect(screen.getByText('Documentos')).toBeInTheDocument();
    });

    it('debe resaltar el enlace activo', () => {
        renderWithRouter();
        const menuBtn = screen.getByRole('button');
        userEvent.click(menuBtn); // No esperamos, verificamos clase

        // El enlace Planes debería tener bg-primary-extradark porque está activo
        const planesLink = screen.getByText('Planes');
        expect(planesLink.className).toContain('bg-primary-extradark');
    });
});