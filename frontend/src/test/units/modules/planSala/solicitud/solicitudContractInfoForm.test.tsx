// src/test/units/modules/planSala/solicitud/solicitudContractInfoForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContratoInfoForm } from '../../../../../planes/planSala/solicitud/solicitudContractInfoForm';
import type { ContratoDataType } from '../../../../../planes/planSala/solicitud/solicitudContractInfoForm';

const datosValidos: ContratoDataType = {
    agente: {
        nombre: 'Juan', apellido: 'Pérez', unidad: 'TI',
        cargo: 'Especialista', telefono: '55555555', correo: 'juan@test.com',
    },
    especialista: {
        nombre: 'María', telefono: '55555555', correo: 'maria@test.com',
    },
    ubicacion: {
        municipio: 'La Habana', provincia: 'La Habana',
    },
    facturacion: { tipo: 'comercial' },
};

describe('ContratoInfoForm', () => {
    it('debe renderizar los 4 fieldsets', () => {
        const { container } = render(<ContratoInfoForm onSubmit={() => {}} />);
        expect(screen.getByText('Agente Comercial')).toBeInTheDocument();
        expect(screen.getByText('Especialista Técnico')).toBeInTheDocument();
        expect(screen.getByText('Ubicación del Cliente')).toBeInTheDocument();
        expect(screen.getByText('Facturación')).toBeInTheDocument();
    });

    const getInputInFieldset = (container: HTMLElement, fieldsetLegend: string, labelText: string): HTMLInputElement => {
        const fieldsets = container.querySelectorAll('fieldset');
        for (const fs of fieldsets) {
            const legend = fs.querySelector('legend');
            if (legend?.textContent?.includes(fieldsetLegend)) {
                const labels = fs.querySelectorAll('label');
                for (const label of labels) {
                    if (label.textContent?.includes(labelText)) {
                        const input = label.parentElement?.querySelector('input');
                        if (input) return input as HTMLInputElement;
                    }
                }
            }
        }
        throw new Error(`No se encontró input en fieldset "${fieldsetLegend}" con label "${labelText}"`);
    };

    // En los tests:
    it('debe mostrar error si falta nombre del agente', async () => {
        const { container } = render(<ContratoInfoForm onSubmit={() => {}} />);

        const apellidoInput = getInputInFieldset(container, 'Agente Comercial', 'Apellido');
        await userEvent.type(apellidoInput, 'Pérez');

        await userEvent.click(screen.getByText('Guardar Datos del Contrato'));

        await waitFor(() => {
            const fieldset = container.querySelector('fieldset');
            expect(fieldset?.textContent).toMatch(/Nombre requerido/);
        });
    });

    it('debe mostrar error con correo inválido del agente', async () => {
        const { container } = render(<ContratoInfoForm onSubmit={() => {}} />);

        const nombreInput = getInputInFieldset(container, 'Agente Comercial', 'Nombre');
        await userEvent.type(nombreInput, 'Juan');
        const apellidoInput = getInputInFieldset(container, 'Agente Comercial', 'Apellido');
        await userEvent.type(apellidoInput, 'Pérez');
        const correoInput = getInputInFieldset(container, 'Agente Comercial', 'Correo');
        await userEvent.type(correoInput, 'invalido');

        await userEvent.click(screen.getByText('Guardar Datos del Contrato'));

        await waitFor(() => {
            const fieldset = container.querySelector('fieldset');
            expect(fieldset?.textContent).toMatch(/Correo inválido/);
        });
    });

    it('debe mostrar error con teléfono muy corto', async () => {
        const { container } = render(<ContratoInfoForm onSubmit={() => {}} />);

        const telInput = getInputInFieldset(container, 'Agente Comercial', 'Teléfono');
        await userEvent.type(telInput, '123');

        await userEvent.click(screen.getByText('Guardar Datos del Contrato'));

        await waitFor(() => {
            const fieldset = container.querySelector('fieldset');
            expect(fieldset?.textContent).toMatch(/Debe tener 8 digitos/);
        });
    });

    it('debe mostrar input de número al seleccionar facturación telefónica', async () => {
        const { container } = render(<ContratoInfoForm onSubmit={() => {}} />);

        const radioTelefonica = screen.getByLabelText(/Próxima factura telefónica/);
        await userEvent.click(radioTelefonica);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Número')).toBeInTheDocument();
        });
    });

    it('debe mostrar error si facturación telefónica sin número', async () => {
        const { container } = render(<ContratoInfoForm onSubmit={() => {}} />);

        const radioTelefonica = screen.getByLabelText(/Próxima factura telefónica/);
        await userEvent.click(radioTelefonica);

        await userEvent.click(screen.getByText('Guardar Datos del Contrato'));

        await waitFor(() => {
            expect(screen.getByText(/Debe tener 8 dígitos/)).toBeInTheDocument();
        });
    });

    it('debe llamar onSubmit con datos válidos', async () => {
        const onSubmit = vi.fn();
        const { container } = render(<ContratoInfoForm onSubmit={onSubmit} contratoData={datosValidos} />);

        await userEvent.click(screen.getByText('Guardar Datos del Contrato'));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(datosValidos);
        });
    });
});