// src/test/units/modules/planSala/solicitud/solicitudSalaForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SolicitudForm } from '../../../../../planes/planSala/solicitud/solicitudForm';

const planesMock = [
    { id: 1, nombre: 'Plan A' },
    { id: 2, nombre: 'Plan B' },
];

const getByLabel = (container: HTMLElement, labelText: string): HTMLElement => {
    const labels = container.querySelectorAll('label');
    for (const label of labels) {
        if (label.textContent?.trim().startsWith(labelText)) {
            const input = label.parentElement?.querySelector('input, select');
            if (input) return input as HTMLElement;
        }
    }
    throw new Error(`No label: ${labelText}`);
};

describe('SolicitudForm', () => {
    it('debe mostrar los planes seleccionados', () => {
        render(<SolicitudForm selectedPlanes={planesMock} onSubmit={() => {}} onCancel={() => {}} />);
        expect(screen.getByText('1. Plan A')).toBeInTheDocument();
    });

    it('debe mostrar el título combinado', () => {
        render(<SolicitudForm selectedPlanes={planesMock} onSubmit={() => {}} onCancel={() => {}} />);
        expect(screen.getByText('Plan A + Plan B')).toBeInTheDocument();
    });

    it('debe mostrar campos de fecha simple', () => {
        const { container } = render(<SolicitudForm selectedPlanes={planesMock} onSubmit={() => {}} onCancel={() => {}} />);
        expect(getByLabel(container, 'Fecha')).toBeInTheDocument();
    });

    it('debe mostrar duración 2h', () => {
        render(<SolicitudForm selectedPlanes={planesMock} onSubmit={() => {}} onCancel={() => {}} />);
        expect(screen.getByText('Total: 2h')).toBeInTheDocument();
    });

    it('debe mostrar checkbox grabación', () => {
        render(<SolicitudForm selectedPlanes={planesMock} onSubmit={() => {}} onCancel={() => {}} />);
        expect(screen.getByText('Grabar videoconferencia')).toBeInTheDocument();
    });

    it('debe cambiar a semanal y mostrar Desde/Hasta', async () => {
        const { container } = render(<SolicitudForm selectedPlanes={planesMock} onSubmit={() => {}} onCancel={() => {}} />);
        await userEvent.selectOptions(getByLabel(container, 'Tipo') as HTMLSelectElement, 'semanal');
        expect(getByLabel(container, 'Desde')).toBeInTheDocument();
    });

    it('debe mostrar días semana', async () => {
        const { container } = render(<SolicitudForm selectedPlanes={planesMock} onSubmit={() => {}} onCancel={() => {}} />);
        await userEvent.selectOptions(getByLabel(container, 'Tipo') as HTMLSelectElement, 'semanal');
        expect(screen.getByText('Lunes')).toBeInTheDocument();
    });

    it('debe mostrar días mes', async () => {
        const { container } = render(<SolicitudForm selectedPlanes={planesMock} onSubmit={() => {}} onCancel={() => {}} />);
        await userEvent.selectOptions(getByLabel(container, 'Tipo') as HTMLSelectElement, 'mensual_dias');
        expect(screen.getByText('31')).toBeInTheDocument();
    });

    it('debe mostrar semana/día', async () => {
        const { container } = render(<SolicitudForm selectedPlanes={planesMock} onSubmit={() => {}} onCancel={() => {}} />);
        await userEvent.selectOptions(getByLabel(container, 'Tipo') as HTMLSelectElement, 'mensual_semana');
        expect(getByLabel(container, 'Semana')).toBeInTheDocument();
    });

    it('debe togglear día semana', async () => {
        const { container } = render(<SolicitudForm selectedPlanes={planesMock} onSubmit={() => {}} onCancel={() => {}} />);
        await userEvent.selectOptions(getByLabel(container, 'Tipo') as HTMLSelectElement, 'semanal');
        const lunes = screen.getByText('Lunes');
        await userEvent.click(lunes);
        expect(lunes.className).not.toContain('bg-primary-dark');
    });

    it('debe togglear día mes', async () => {
        const { container } = render(<SolicitudForm selectedPlanes={planesMock} onSubmit={() => {}} onCancel={() => {}} />);
        await userEvent.selectOptions(getByLabel(container, 'Tipo') as HTMLSelectElement, 'mensual_dias');
        const dia1 = screen.getByText('1');
        await userEvent.click(dia1);
        expect(dia1.className).not.toContain('bg-primary-dark');
    });

    it('debe cambiar horas', async () => {
        const { container } = render(<SolicitudForm selectedPlanes={planesMock} onSubmit={() => {}} onCancel={() => {}} />);
        const h = getByLabel(container, 'Duración (horas)') as HTMLInputElement;
        await userEvent.clear(h);
        await userEvent.type(h, '3');
        expect(screen.getByText('Total: 3h')).toBeInTheDocument();
    });

    it('debe limitar minutos', async () => {
        const { container } = render(<SolicitudForm selectedPlanes={planesMock} onSubmit={() => {}} onCancel={() => {}} />);
        const m = getByLabel(container, 'Duración (minutos)') as HTMLInputElement;
        await userEvent.clear(m);
        await userEvent.type(m, '75');
        expect(m.value).toBe('59');
    });

    it('debe submit con fecha simple', async () => {
        const onSubmit = vi.fn();
        render(<SolicitudForm selectedPlanes={planesMock} onSubmit={onSubmit} onCancel={() => {}} />);
        await userEvent.click(screen.getByText('Crear Solicitud'));
        await waitFor(() => {
            expect(onSubmit.mock.calls[0][0][0].nombre).toBe('Plan A&&Plan B');
        });
    });

    it('debe submit con grabación', async () => {
        const onSubmit = vi.fn();
        const { container } = render(<SolicitudForm selectedPlanes={planesMock} onSubmit={onSubmit} onCancel={() => {}} />);
        const cb = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
        await userEvent.click(cb);
        await userEvent.click(screen.getByText('Crear Solicitud'));
        await waitFor(() => expect(onSubmit.mock.calls[0][0][0].grabar).toBe(true));
    });

    it('debe generar múltiples con semanal', async () => {
        const onSubmit = vi.fn();
        const { container } = render(<SolicitudForm selectedPlanes={[{id:1,nombre:'Solo'}]} onSubmit={onSubmit} onCancel={() => {}} />);
        await userEvent.selectOptions(getByLabel(container, 'Tipo') as HTMLSelectElement, 'semanal');
        await userEvent.click(screen.getByText('Crear Solicitud'));
        await waitFor(() => expect(onSubmit.mock.calls[0][0].length).toBeGreaterThan(1));
    });

    it('debe cambiar duración en minutos y mostrar total', async () => {
        const { container } = render(<SolicitudForm selectedPlanes={planesMock} onSubmit={() => {}} onCancel={() => {}} />);
        const h = getByLabel(container, 'Duración (horas)') as HTMLInputElement;
        const m = getByLabel(container, 'Duración (minutos)') as HTMLInputElement;
        await userEvent.clear(h);
        await userEvent.type(h, '1');
        await userEvent.clear(m);
        await userEvent.type(m, '30');
        expect(screen.getByText('Total: 1h 30min')).toBeInTheDocument();
    });

    it('debe generar fechas con recurrencia mensual_dias', async () => {
        const onSubmit = vi.fn();
        const { container } = render(
            <SolicitudForm selectedPlanes={[{ id: 1, nombre: 'Plan Solo' }]} onSubmit={onSubmit} onCancel={() => {}} />
        );
        await userEvent.selectOptions(getByLabel(container, 'Tipo') as HTMLSelectElement, 'mensual_dias');
        await userEvent.click(screen.getByText('Crear Solicitud'));
        await waitFor(() => {
            const solicitudes = onSubmit.mock.calls[0][0];
            expect(solicitudes.length).toBeGreaterThan(0);
            solicitudes.forEach((s: any) => {
                expect(s.planIds).toEqual([1]);
                expect(s.estado).toBe('nueva');
            });
        });
    });

    it('debe cancelar', async () => {
        const onCancel = vi.fn();
        render(<SolicitudForm selectedPlanes={planesMock} onSubmit={() => {}} onCancel={onCancel} />);
        await userEvent.click(screen.getByText('Cancelar'));
        expect(onCancel).toHaveBeenCalled();
    });

    it('debe mostrar Creando...', () => {
        render(<SolicitudForm selectedPlanes={planesMock} onSubmit={() => {}} onCancel={() => {}} loading={true} />);
        expect(screen.getByText('Creando...')).toBeInTheDocument();
    });
});