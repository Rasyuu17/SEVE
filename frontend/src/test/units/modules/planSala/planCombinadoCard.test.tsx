// src/test/units/modules/planSala/planCombinadoCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlanCombinadoCard } from '../../../../planes/planSala/combinados/planCombinadoCard';
import type { PlanSala } from '../../../../planes/planSala/planSala.interface';

const planIntegrable = (id: number, nombre: string, overrides: Partial<PlanSala> = {}): PlanSala => ({
    id, nombre, tarifa: 45000, tasa_fk: 1,
    normalizacionTiempo: 'mes', categoriaAnexable: 'sala',
    esIntegrable: true, esNacional: true,
    cantUsuariosLinea: 10, cantUsuariosInvitados: 5,
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
    ...overrides,
});

const getTarifaTotal = () => screen.getByText('Tarifa total:').nextElementSibling;

describe('PlanCombinadoCard', () => {
    it('debe mostrar mensaje sin planes integrables', () => {
        render(<PlanCombinadoCard planesIntegrables={[]} />);
        expect(screen.getByText('No hay planes integrables disponibles')).toBeInTheDocument();
    });

    it('debe mostrar lista de planes integrables', () => {
        render(<PlanCombinadoCard planesIntegrables={[planIntegrable(1, 'Plan A'), planIntegrable(2, 'Plan B')]} />);
        expect(screen.getByText('Plan A')).toBeInTheDocument();
        expect(screen.getByText('Plan B')).toBeInTheDocument();
    });

    it('debe mostrar vista previa al seleccionar un plan', async () => {
        render(<PlanCombinadoCard planesIntegrables={[planIntegrable(1, 'Plan A')]} />);

        await userEvent.click(screen.getByText('Plan A'));

        await waitFor(() => {
            expect(getTarifaTotal()?.textContent).toMatch(/\$450\.00/);
            expect(screen.getByText('1')).toBeInTheDocument();
        });
    });

    it('debe sumar tarifas al seleccionar múltiples planes', async () => {
        render(<PlanCombinadoCard planesIntegrables={[
            planIntegrable(1, 'Plan A'),
            planIntegrable(2, 'Plan B'),
        ]} />);

        await userEvent.click(screen.getByText('Plan A'));
        await userEvent.click(screen.getByText('Plan B'));

        await waitFor(() => {
            expect(getTarifaTotal()?.textContent).toMatch(/\$900\.00/);
            expect(screen.getByText('2')).toBeInTheDocument();
        });
    });

    it('debe quitar plan al deseleccionar', async () => {
        render(<PlanCombinadoCard planesIntegrables={[planIntegrable(1, 'Plan A')]} />);

        await userEvent.click(screen.getByText('Plan A'));
        await waitFor(() => expect(getTarifaTotal()?.textContent).toMatch(/\$450\.00/));

        await userEvent.click(screen.getByText('Plan A'));
        await waitFor(() => expect(screen.queryByText('Tarifa total:')).not.toBeInTheDocument());
    });

    it('debe llamar onSelect con los planes seleccionados', async () => {
        const onSelect = vi.fn();
        const plan = planIntegrable(1, 'Plan A');
        render(<PlanCombinadoCard planesIntegrables={[plan]} onSelect={onSelect} />);

        await userEvent.click(screen.getByText('Plan A'));
        await waitFor(() => expect(screen.getByText('Seleccionar Combinado')).toBeInTheDocument());

        await userEvent.click(screen.getByText('Seleccionar Combinado'));
        expect(onSelect).toHaveBeenCalledWith([plan]);
    });

    it('debe mostrar badges de VC si el plan las tiene', async () => {
        render(<PlanCombinadoCard planesIntegrables={[planIntegrable(1, 'Plan VC', {
            tieneVCReunionInteligente: true,
            tieneVCTodosPantalla: true,
        })]} />);

        await userEvent.click(screen.getByText('Plan VC'));

        await waitFor(() => {
            expect(screen.getByText('Reunión inteligente')).toBeInTheDocument();
            expect(screen.getByText('Todos en pantalla')).toBeInTheDocument();
        });
    });
});