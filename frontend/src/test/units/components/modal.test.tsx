// src/test/units/Modal.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModalComponent from '../../../components/Modal';

describe('ModalComponent', () => {
    it('no debe renderizar cuando isOpen es false', () => {
        render(
            <ModalComponent isOpen={false} onClose={() => {}}>
                <p>Contenido</p>
            </ModalComponent>
        );
        expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
    });

    it('debe renderizar el contenido cuando isOpen es true', () => {
        render(
            <ModalComponent isOpen={true} onClose={() => {}}>
                <p>Contenido visible</p>
            </ModalComponent>
        );
        expect(screen.getByText('Contenido visible')).toBeInTheDocument();
    });

    it('debe mostrar el título si se proporciona', () => {
        render(
            <ModalComponent isOpen={true} onClose={() => {}} title="Título Modal">
                <p>Contenido</p>
            </ModalComponent>
        );
        expect(screen.getByText('Título Modal')).toBeInTheDocument();
    });

    it('no debe mostrar título si no se proporciona', () => {
        render(
            <ModalComponent isOpen={true} onClose={() => {}}>
                <p>Contenido</p>
            </ModalComponent>
        );
        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('debe llamar onClose al hacer clic en el botón cerrar', async () => {
        const onClose = vi.fn();
        render(
            <ModalComponent isOpen={true} onClose={onClose}>
                <p>Contenido</p>
            </ModalComponent>
        );
        // El botón es el del SVG (X)
        const closeButton = screen.getByRole('button');
        await userEvent.click(closeButton);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('debe llamar onClose al presionar Escape', async () => {
        const onClose = vi.fn();
        render(
            <ModalComponent isOpen={true} onClose={onClose}>
                <p>Contenido</p>
            </ModalComponent>
        );
        await userEvent.keyboard('{Escape}');
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});