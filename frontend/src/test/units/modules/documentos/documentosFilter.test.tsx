// src/test/units/modules/documentos/documentosFilters.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentoFiltersComponent } from '../../../../documentos/documentosFilters';

const filtersVacios = {
    search: '', entidad: '', nombre_solicitante: '', correo: '',
    id_contratoGeneral: '', id_contratoEspecifico: '', numero: '',
    fechaDesde: '', fechaHasta: '',
};

describe('DocumentoFiltersComponent', () => {
    it('debe renderizar los campos básicos', () => {
        render(<DocumentoFiltersComponent filters={filtersVacios} onChange={() => {}} onSearch={() => {}} />);
        expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Entidad')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Solicitante')).toBeInTheDocument();
    });

    it('debe mostrar campos expandidos al hacer clic en Más', async () => {
        render(<DocumentoFiltersComponent filters={filtersVacios} onChange={() => {}} onSearch={() => {}} />);
        await userEvent.click(screen.getByText('Más'));
        expect(screen.getByPlaceholderText('correo@ejemplo.com')).toBeInTheDocument();
        expect(screen.getByText('Desde')).toBeInTheDocument();
        expect(screen.getByText('Hasta')).toBeInTheDocument();
    });

    it('debe colapsar campos al hacer clic en Menos', async () => {
        render(<DocumentoFiltersComponent filters={filtersVacios} onChange={() => {}} onSearch={() => {}} />);
        await userEvent.click(screen.getByText('Más'));
        await userEvent.click(screen.getByText('Menos'));
        expect(screen.queryByPlaceholderText('correo@ejemplo.com')).not.toBeInTheDocument();
    });

    it('debe llamar onChange con el campo search al escribir', async () => {
        const onChange = vi.fn();
        render(<DocumentoFiltersComponent filters={filtersVacios} onChange={onChange} onSearch={() => {}} />);
        await userEvent.type(screen.getByPlaceholderText('Buscar...'), 'test');
        expect(onChange).toHaveBeenCalledTimes(4);
        expect(onChange.mock.calls[0][0]).toHaveProperty('search');
    });

    it('debe llamar onSearch al hacer clic en Buscar', async () => {
        const onSearch = vi.fn();
        render(<DocumentoFiltersComponent filters={filtersVacios} onChange={() => {}} onSearch={onSearch} />);
        await userEvent.click(screen.getByText('Buscar'));
        expect(onSearch).toHaveBeenCalledTimes(1);
    });

    it('debe llamar onSearch al presionar Enter', async () => {
        const onSearch = vi.fn();
        render(<DocumentoFiltersComponent filters={filtersVacios} onChange={() => {}} onSearch={onSearch} />);
        const input = screen.getByPlaceholderText('Buscar...');
        await userEvent.type(input, '{Enter}');
        expect(onSearch).toHaveBeenCalledTimes(1);
    });

    it('debe limpiar filtros al hacer clic en X', async () => {
        const onChange = vi.fn();
        const filtersConDatos = { ...filtersVacios, search: 'test', entidad: 'Empresa' };
        render(<DocumentoFiltersComponent filters={filtersConDatos} onChange={onChange} onSearch={() => {}} />);
        
        const clearButton = screen.getByTitle('Limpiar');
        await userEvent.click(clearButton);
        
        const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(lastCall.search).toBe('');
        expect(lastCall.entidad).toBe('');
    });

    it('debe mostrar valores iniciales', () => {
        const filtersConDatos = { ...filtersVacios, entidad: 'ETECSA', nombre_solicitante: 'Juan' };
        render(<DocumentoFiltersComponent filters={filtersConDatos} onChange={() => {}} onSearch={() => {}} />);
        expect(screen.getByDisplayValue('ETECSA')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Juan')).toBeInTheDocument();
    });
});