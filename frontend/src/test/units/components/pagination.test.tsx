// src/utils/pagination.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from '../../../utils/pagination';

describe('Pagination', () => {
    it('debe renderizar botones para pocas páginas', () => {
        render(
            <Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />
        );
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('debe mostrar elipsis para muchas páginas', () => {
        render(
            <Pagination currentPage={5} totalPages={20} onPageChange={() => {}} />
        );
        expect(screen.getAllByText('...')).toHaveLength(2);
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('debe marcar la página actual en negrita', () => {
        render(
            <Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />
        );
        const currentButton = screen.getByText('3');
        expect(currentButton.className).toContain('font-bold');
    });

    it('debe deshabilitar botón Anterior en página 1', () => {
        render(
            <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
        );
        expect(screen.getByText('Anterior')).toBeDisabled();
    });

    it('debe deshabilitar botón Siguiente en última página', () => {
        render(
            <Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />
        );
        expect(screen.getByText('Siguiente')).toBeDisabled();
    });

    it('debe llamar onPageChange al hacer clic en una página', async () => {
        const onPageChange = vi.fn();
        render(
            <Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />
        );
        await userEvent.click(screen.getByText('3'));
        expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('debe llamar onPageChange al hacer clic en Siguiente', async () => {
        const onPageChange = vi.fn();
        render(
            <Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />
        );
        await userEvent.click(screen.getByText('Siguiente'));
        expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('debe llamar onPageChange al hacer clic en Anterior', async () => {
        const onPageChange = vi.fn();
        render(
            <Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />
        );
        await userEvent.click(screen.getByText('Anterior'));
        expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('no debe llamar onPageChange al hacer clic en elipsis', async () => {
        const onPageChange = vi.fn();
        render(
            <Pagination currentPage={5} totalPages={20} onPageChange={onPageChange} />
        );
        const elipsis = screen.getAllByText('...');
        await userEvent.click(elipsis[0]);
        expect(onPageChange).not.toHaveBeenCalled();
    });
});