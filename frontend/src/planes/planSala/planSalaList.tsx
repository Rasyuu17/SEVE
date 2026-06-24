import { useEffect, useState } from 'react';
import { CalendarIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

import { planApi } from './planSala.client';
import type { PlanSala } from './planSala.interface';
import ModalComponent from '../../components/Modal';

interface PlanSalaListProps {
  onEdit: (plan: PlanSala) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
}

export const PlanSalaList = ({ onEdit, onDelete, onCreate }: PlanSalaListProps) => {
  const [planes, setPlanes] = useState<PlanSala[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
  const [toDelete,setToDelete] = useState<number|undefined>(undefined)
  const navigate = useNavigate();

  const cargarPlanes = async () => {
    try {
      const response = await planApi.listar();
      setPlanes(response.data);
    } catch (error) {
      console.error('Error al cargar planes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPlanes();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Cargando planes...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary-dark">Planes Sala</h2>
        <div className='flex justify-between items-center gap-3'>
          <button
              onClick={() => navigate('/planes/sala/calendario-operativo')}
              className="bg-primary-dark text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
              <CalendarIcon className="w-5 h-5" />
              Calendario Operativo
          </button>
          <button
            onClick={onCreate}
            className="flex items-center gap-2 bg-primary-dark text-white px-4 py-2 rounded-md hover:bg-primary transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Nuevo Plan
          </button>
        </div>
      </div>

      {planes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No hay planes registrados
        </div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarifa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiempo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuarios Invitados</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuarios en Línea</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Almacenamiento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salas</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actualizar</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Eliminar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {planes.map((plan, index) => (
                <tr
                  key={plan.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {plan.PlanBaseModel!.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                    ${plan.PlanBaseModel!.tarifa / 100}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {plan.PlanBaseModel!.normalizacionTiempo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {plan.cantUsuariosInvitados}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {plan.cantUsuariosLinea}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {plan.tiempoAlmacenamiento} días
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-light text-primary-dark">
                      {plan.SalaModels?.length ? plan.SalaModels.length : 0} salas
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => onEdit(plan)}
                      title="Editar"
                      className="text-primary hover:text-primary-dark transition-colors"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={()=>{setToDelete(plan.id),setIsDeleteModalOpen(true)}}
                      title="Eliminar"
                      className="text-error hover:text-red-800 transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <ModalComponent isOpen={isDeleteModalOpen} onClose={()=>setIsDeleteModalOpen(false)} title='Eliminar plan'>
        <h3>¿Estás seguro de que deseas eliminar este plan?</h3>
        <button onClick={()=>onDelete(toDelete!)}>Confirmar</button>
      </ModalComponent>
    </div>
  );
};