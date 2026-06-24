// src/test/units/modules/planSala/solicitudList.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SolicitudList, type Solicitud } from '../../../../../planes/planSala/solicitud/solicitudList';

const solicitudMock = (overrides: Partial<Solicitud> = {}): Solicitud => ({
    nombre: 'Plan Test',
    title: 'Plan Test',
    fecha_inicio: new Date('2026-06-01T10:00:00'),
    fecha_fin: new Date('2026-06-01T12:00:00'),
    planIds: [1],
    estado: 'nueva',
    valida: undefined,
    grabar: false,
    ...overrides,
});

describe('SolicitudList', () => {
    it('debe mostrar mensaje cuando no hay solicitudes', () => {
        render(<SolicitudList solicitudes={[]} onDelete={() => {}} onToggleGrabar={() => {}} />);
        expect(screen.getByText('No hay solicitudes')).toBeInTheDocument();
    });

    it('debe mostrar la cantidad de solicitudes', () => {
        render(
            <SolicitudList
                solicitudes={[solicitudMock(), solicitudMock({ title: 'Plan B' })]}
                onDelete={() => {}}
                onToggleGrabar={() => {}}
            />
        );
        expect(screen.getByText('Solicitudes (2)')).toBeInTheDocument();
    });

    it('debe mostrar el título de cada solicitud', () => {
        render(
            <SolicitudList
                solicitudes={[solicitudMock({ title: 'Plan VIP' })]}
                onDelete={() => {}}
                onToggleGrabar={() => {}}
            />
        );
        expect(screen.getByText('Plan VIP')).toBeInTheDocument();
    });

    it('debe mostrar borde verde si es válida', () => {
        render(
            <SolicitudList
                solicitudes={[solicitudMock({ valida: true })]}
                onDelete={() => {}}
                onToggleGrabar={() => {}}
            />
        );
        const card = screen.getByText('Plan Test').closest('.border-success');
        expect(card).toBeInTheDocument();
    });

    it('debe mostrar borde rojo si no es válida', () => {
        render(
            <SolicitudList
                solicitudes={[solicitudMock({ valida: false })]}
                onDelete={() => {}}
                onToggleGrabar={() => {}}
            />
        );
        const card = screen.getByText('Plan Test').closest('.border-error');
        expect(card).toBeInTheDocument();
    });

    it('debe llamar onDelete al hacer clic en eliminar', async () => {
        const onDelete = vi.fn();
        render(
            <SolicitudList
                solicitudes={[solicitudMock()]}
                onDelete={onDelete}
                onToggleGrabar={() => {}}
            />
        );
        const buttons = screen.getAllByRole('button');
        // El segundo botón es el de eliminar (TrashIcon)
        await userEvent.click(buttons[1]);
        expect(onDelete).toHaveBeenCalledWith(0);
    });

    it('debe llamar onToggleGrabar al hacer clic en grabación', async () => {
        const onToggleGrabar = vi.fn();
        render(
            <SolicitudList
                solicitudes={[solicitudMock()]}
                onDelete={() => {}}
                onToggleGrabar={onToggleGrabar}
            />
        );
        const buttons = screen.getAllByRole('button');
        // El primer botón es el de grabación (VideoCameraIcon)
        await userEvent.click(buttons[0]);
        expect(onToggleGrabar).toHaveBeenCalledWith(0);
    });
});