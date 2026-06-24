import { useEffect, useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import ModalComponent from '../../../components/Modal';
import Pagination from '../../../utils/pagination';
import { salaApi } from './sala.client';
import { SalaForm } from './salaForm';
import type { Sala, SalaType } from './sala.interface';

export const SalaList = () => {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [disponibles, setDisponibles] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSala, setEditingSala] = useState<(SalaType & { id: number }) | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; sala: Sala | null }>({ open: false, sala: null });
  const [page, setPage] = useState(1);
  const limit = 5;

  const cargarSalas = async () => {
    try {
      const [todasRes, disponiblesRes] = await Promise.all([
        salaApi.listar(),
        salaApi.listarDisponibles(),
      ]);
      setSalas(todasRes.data);
      setDisponibles(disponiblesRes.data);
    } catch (error) {
      console.error('Error al cargar salas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSalas();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.sala) {
      return;
    }
    try {
      await salaApi.eliminar(deleteConfirm.sala.id);
      toast.success('Sala eliminada correctamente');
      setDeleteConfirm({ open: false, sala: null });
      cargarSalas();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al eliminar la sala');
    }
  };

  const estaDisponible = (salaId: number) => {
    return disponibles.some(d => d.id === salaId);
  };

  const totalPages = Math.ceil(salas.length / limit);
  const paginadas = salas.slice((page - 1) * limit, page * limit);

  if (loading) {
    return <div className="bg-white rounded-lg shadow p-6">Cargando...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Lista de Salas</h2>
        <button
          onClick={cargarSalas}
          className="text-primary hover:text-primary-extradark text-sm"
        >
          Actualizar
        </button>
      </div>

      {salas.length === 0 ? (
        <p className="text-gray-500">No hay salas registradas</p>
      ) : (
        <>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-gray-500 uppercase text-xs">Nombre</th>
                <th className="px-4 py-2 text-left text-gray-500 uppercase text-xs">Ubicación</th>
                <th className="px-4 py-2 text-left text-gray-500 uppercase text-xs">Terminal</th>
                <th className="px-4 py-2 text-left text-gray-500 uppercase text-xs">Estado</th>
                <th className="px-4 py-2 text-center text-gray-500 uppercase text-xs w-20">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginadas.map((sala) => (
                <tr key={sala.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{sala.nombre}</td>
                  <td className="px-4 py-2 text-gray-600">{sala.ubicacion}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs px-2 py-1 rounded ${sala.tieneTerminal ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {sala.tieneTerminal ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${estaDisponible(sala.id) ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {estaDisponible(sala.id) ? 'Disponible' : 'Ocupada'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setEditingSala({ id: sala.id, nombre: sala.nombre, tieneTerminal: sala.tieneTerminal, ubicacion: sala.ubicacion })}
                        className="text-primary hover:text-primary-dark"
                        title="Editar"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ open: true, sala })}
                        className="text-error hover:text-red-800"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-3 pt-3 border-t">
              <span className="text-xs text-gray-500">
                {salas.length} salas
              </span>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      {editingSala && (
        <ModalComponent
          isOpen={true}
          onClose={() => setEditingSala(null)}
          title="Editar Sala"
        >
          <SalaForm
            initialData={editingSala}
            onSuccess={() => {
              setEditingSala(null);
              cargarSalas();
            }}
            onCancel={() => setEditingSala(null)}
          />
        </ModalComponent>
      )}

      <ModalComponent
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, sala: null })}
        title="Eliminar Sala"
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-gray-600">
            ¿Está seguro de eliminar la sala <strong>{deleteConfirm.sala?.nombre}</strong>?
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDeleteConfirm}
              className="bg-error text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Eliminar
            </button>
            <button
              onClick={() => setDeleteConfirm({ open: false, sala: null })}
              className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </ModalComponent>
    </div>
  );
};