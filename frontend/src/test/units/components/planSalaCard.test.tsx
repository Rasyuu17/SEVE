// src/test/units/components/planSalaCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlanSalaCard } from '../../../planes/planSala/components/planSalaCard';
import type { PlanSala } from '../../../planes/planSala/planSala.interface';

const planMock: PlanSala = {
    id: 1,
    tasa_fk: 1,
    nombre: 'Plan Premium',
    tarifa: 45000,
    normalizacionTiempo: 'mes',
    categoriaAnexable: 'sala',
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
        id: 1,
        tasa_fk: 1,
        nombre: 'Plan Premium',
        tarifa: 45000,
        normalizacionTiempo: 'mes',
        categoriaAnexable: 'sala',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        deletedAt: null,
        TasaCambioModel: { id: 1, tasa: 320 },
    },
};

describe('PlanSalaCard', () => {
    it('debe mostrar el nombre del plan', () => {
        render(<PlanSalaCard plan={planMock} />);
        expect(screen.getByText('Plan Premium')).toBeInTheDocument();
    });

    it('debe mostrar la tarifa en cup', () => {
        render(<PlanSalaCard plan={planMock} />);
        expect(screen.getByText(/450\.00/)).toBeInTheDocument();
        expect(screen.getByText(/cup/)).toBeInTheDocument();
    });

    it('debe mostrar la tarifa en usd', () => {
        render(<PlanSalaCard plan={planMock} />);
        expect(screen.getByText(/140\.63/)).toBeInTheDocument();
        expect(screen.getByText(/usd/)).toBeInTheDocument();
    });

    it('debe mostrar la cantidad de usuarios en línea', () => {
        render(<PlanSalaCard plan={planMock} />);
        expect(screen.getByText('Usuarios en línea:')).toBeInTheDocument();
        const elementos = screen.getAllByText('16');
        expect(elementos.length).toBeGreaterThanOrEqual(1);
    });

    it('debe mostrar la normalización de tiempo', () => {
        render(<PlanSalaCard plan={planMock} />);
        expect(screen.getByText('por mes')).toBeInTheDocument();
    });

    it('debe mostrar el tiempo de almacenamiento', () => {
        render(<PlanSalaCard plan={planMock} />);
        expect(screen.getByText('30 días')).toBeInTheDocument();
    });

    it('no debe mostrar botón Seleccionar si onSelect no se pasa', () => {
        render(<PlanSalaCard plan={planMock} />);
        expect(screen.queryByText('Seleccionar')).not.toBeInTheDocument();
    });

    it('debe mostrar botón Seleccionar si onSelect se pasa', () => {
        render(<PlanSalaCard plan={planMock} onSelect={() => {}} />);
        expect(screen.getByText('Seleccionar')).toBeInTheDocument();
    });

    it('debe llamar onSelect al hacer clic en Seleccionar', async () => {
        const onSelect = vi.fn();
        render(<PlanSalaCard plan={planMock} onSelect={onSelect} />);
        await userEvent.click(screen.getByText('Seleccionar'));
        expect(onSelect).toHaveBeenCalledWith(planMock);
    });
});