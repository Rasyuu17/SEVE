import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

import type { DocumentoFilters as DocumentoFiltersType } from './documentos.interface';

interface Props {
  filters: DocumentoFiltersType;
  onChange: (filters: DocumentoFiltersType) => void;
  onSearch: () => void;
}

export function DocumentoFiltersComponent({ filters, onChange, onSearch }: Props) {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  const handleClear = () => {
    onChange({
      search: '',
      entidad: '',
      nombre_solicitante: '',
      correo: '',
      id_contratoGeneral: '',
      id_contratoEspecifico: '',
      numero: '',
      fechaDesde: '',
      fechaHasta: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-45">
          <input
            type="text"
            name="search"
            value={filters.search || ''}
            onChange={handleChange}
            placeholder="Buscar..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="w-37.5">
          <input
            type="text"
            name="entidad"
            value={filters.entidad || ''}
            onChange={handleChange}
            placeholder="Entidad"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="w-40">
          <input
            type="text"
            name="nombre_solicitante"
            value={filters.nombre_solicitante || ''}
            onChange={handleChange}
            placeholder="Solicitante"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-primary-dark text-white px-4 py-2 rounded-md hover:bg-primary-extradark flex items-center gap-1 text-sm"
        >
          <MagnifyingGlassIcon className="h-4 w-4" />
          Buscar
        </button>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-gray-500 hover:text-gray-700 p-2 flex items-center gap-1 text-sm"
        >
          {expanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
          {expanded ? 'Menos' : 'Más'}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="text-gray-400 hover:text-gray-600 p-2"
          title="Limpiar"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {expanded && (
        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-100">
          <div className="w-45">
            <label className="block text-xs text-gray-500 mb-1">Correo</label>
            <input
              type="text"
              name="correo"
              value={filters.correo || ''}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="w-32.5">
            <label className="block text-xs text-gray-500 mb-1">Contrato Gral</label>
            <input
              type="number"
              name="id_contratoGeneral"
              value={filters.id_contratoGeneral || ''}
              onChange={handleChange}
              placeholder="N°"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="w-32.5">
            <label className="block text-xs text-gray-500 mb-1">Contrato Esp</label>
            <input
              type="number"
              name="id_contratoEspecifico"
              value={filters.id_contratoEspecifico || ''}
              onChange={handleChange}
              placeholder="N°"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="w-30">
            <label className="block text-xs text-gray-500 mb-1">Teléfono</label>
            <input
              type="number"
              name="numero"
              value={filters.numero || ''}
              onChange={handleChange}
              placeholder="N°"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="w-35">
            <label className="block text-xs text-gray-500 mb-1">Desde</label>
            <input
              type="date"
              name="fechaDesde"
              value={filters.fechaDesde || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="w-35">
            <label className="block text-xs text-gray-500 mb-1">Hasta</label>
            <input
              type="date"
              name="fechaHasta"
              value={filters.fechaHasta || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}
    </form>
  );
}