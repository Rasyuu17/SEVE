// src/test/units/modules/planSala/solicitudClientInfoForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientInfoForm } from '../../../../../planes/planSala/solicitud/solicitudClientInfoForm';
import type { ClientDataType } from '../../../../../planes/planSala/solicitud/solicitudClientInfoForm';

const clientDataVacio: ClientDataType = {
    numero: 0,
    entidad: '',
    link_vc: '',
    id_contratoGeneral: 0,
    id_contratoEspecifico: 0,
    solicitante: '',
    correo: '',
    cargo: '',
};

const clientDataValido: ClientDataType = {
    numero: 12345678,
    entidad: 'Empresa Test',
    link_vc: 'https://meet.test.com/sala',
    id_contratoGeneral: 1,
    id_contratoEspecifico: 1,
    solicitante: 'Juan Pérez',
    correo: 'juan@test.com',
    cargo: 'Director',
};

describe('ClientInfoForm', () => {
    it('debe renderizar el formulario con campos vacíos', () => {
        render(<ClientInfoForm onSubmit={() => {}} clientData={clientDataVacio} validateLink={() => {}} />);
        expect(screen.getByLabelText('Número telefónico')).toBeInTheDocument();
        expect(screen.getByLabelText('Entidad')).toHaveValue('');
        expect(screen.getByLabelText('Correo Electrónico')).toHaveValue('');
    });

    it('debe renderizar con datos iniciales', () => {
        render(<ClientInfoForm onSubmit={() => {}} clientData={clientDataValido} validateLink={() => {}} />);
        expect(screen.getByLabelText('Número telefónico')).toHaveValue(12345678);
        expect(screen.getByLabelText('Entidad')).toHaveValue('Empresa Test');
        expect(screen.getByLabelText('Correo Electrónico')).toHaveValue('juan@test.com');
    });

    it('debe mostrar error con entidad muy corta', async () => {
        render(<ClientInfoForm onSubmit={() => {}} clientData={clientDataVacio} validateLink={() => {}} />);

        await userEvent.type(screen.getByLabelText('Número telefónico'), '12345678');
        await userEvent.type(screen.getByLabelText('Entidad'), 'ab');
        await userEvent.type(screen.getByLabelText('Cargo del solicitante'), 'Director');
        await userEvent.type(screen.getByLabelText('Link de Videoconferencia'), 'https://meet.test.com');
        await userEvent.type(screen.getByLabelText('ID Contrato General'), '1');
        await userEvent.type(screen.getByLabelText('ID Contrato Específico'), '1');
        await userEvent.type(screen.getByLabelText('Solicitante'), 'Juan');
        await userEvent.type(screen.getByLabelText('Correo Electrónico'), 'juan@test.com');

        await userEvent.click(screen.getByText('Guardar Información'));

        await waitFor(() => {
            expect(screen.getByText(/mínima de 3/)).toBeInTheDocument();
        });
    });

    it('debe mostrar error con correo inválido', async () => {
        render(<ClientInfoForm onSubmit={() => {}} clientData={clientDataVacio} validateLink={() => {}} />);

        await userEvent.type(screen.getByLabelText('Número telefónico'), '12345678');
        await userEvent.type(screen.getByLabelText('Entidad'), 'Empresa Test');
        await userEvent.type(screen.getByLabelText('Cargo del solicitante'), 'Director');
        await userEvent.type(screen.getByLabelText('Link de Videoconferencia'), 'https://meet.test.com');
        await userEvent.type(screen.getByLabelText('ID Contrato General'), '1');
        await userEvent.type(screen.getByLabelText('ID Contrato Específico'), '1');
        await userEvent.type(screen.getByLabelText('Solicitante'), 'Juan');
        await userEvent.type(screen.getByLabelText('Correo Electrónico'), 'invalido');

        await userEvent.click(screen.getByText('Guardar Información'));

        await waitFor(() => {
            expect(screen.getByText(/Email inválido/)).toBeInTheDocument();
        });
    });

    it('debe mostrar error con número telefónico muy corto', async () => {
        render(<ClientInfoForm onSubmit={() => {}} clientData={clientDataVacio} validateLink={() => {}} />);

        await userEvent.type(screen.getByLabelText('Número telefónico'), '123');
        await userEvent.type(screen.getByLabelText('Entidad'), 'Empresa Test');
        await userEvent.type(screen.getByLabelText('Cargo del solicitante'), 'Director');
        await userEvent.type(screen.getByLabelText('Link de Videoconferencia'), 'https://meet.test.com');
        await userEvent.type(screen.getByLabelText('ID Contrato General'), '1');
        await userEvent.type(screen.getByLabelText('ID Contrato Específico'), '1');
        await userEvent.type(screen.getByLabelText('Solicitante'), 'Juan');
        await userEvent.type(screen.getByLabelText('Correo Electrónico'), 'juan@test.com');

        await userEvent.click(screen.getByText('Guardar Información'));

        await waitFor(() => {
            expect(screen.getByText(/mínimo 8 dígitos/)).toBeInTheDocument();
        });
    });

    it('debe llamar onSubmit con datos válidos', async () => {
        const onSubmit = vi.fn();
        render(<ClientInfoForm onSubmit={onSubmit} clientData={clientDataValido} validateLink={() => {}} />);

        await userEvent.click(screen.getByText('Guardar Información'));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(clientDataValido);
        });
    });

    it('debe llamar validateLink al hacer clic en Validar', async () => {
        const validateLink = vi.fn();
        render(<ClientInfoForm onSubmit={() => {}} clientData={clientDataValido} validateLink={validateLink} />);

        await userEvent.click(screen.getByText('Validar'));

        expect(validateLink).toHaveBeenCalledWith('https://meet.test.com/sala');
    });
});