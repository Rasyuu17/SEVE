import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { salaApi } from './sala.client';
import type { SalaType } from './sala.interface';
import { salaSchema } from './sala.validator';

interface SalaFormProps {
  initialData?: SalaType & { id: number };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const SalaForm = ({ initialData, onSuccess, onCancel }: SalaFormProps) => {
  const isEditing = !!initialData;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SalaType>({
    resolver: zodResolver(salaSchema),
    defaultValues: {
      nombre: initialData?.nombre || '',
      tieneTerminal: initialData?.tieneTerminal || false,
      ubicacion: initialData?.ubicacion || '',
    },
  });

  const onSubmit = async (data: SalaType) => {
    try {
      if (isEditing) {
        await salaApi.modificar(initialData.id, data);
        toast.success('Sala actualizada exitosamente');
      } else {
        await salaApi.crear(data);
        toast.success('Sala creada exitosamente');
        reset();
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar la sala');
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">{isEditing ? 'Editar Sala' : 'Crear Nueva Sala'}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            {...register('nombre')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark"
          />
          {errors.nombre && (
            <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
          <input
            {...register('ubicacion')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark"
          />
          {errors.ubicacion && (
            <p className="text-red-500 text-sm mt-1">{errors.ubicacion.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="tieneTerminal"
            {...register('tieneTerminal')}
            className="w-4 h-4 text-primary focus:ring-primary-dark"
          />
          <label htmlFor="tieneTerminal" className="text-sm font-medium text-gray-700">
            Tiene Terminal
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-primary-dark text-white py-2 px-4 rounded-md hover:bg-primary-extradark transition-all active:scale-90 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar Sala' : 'Crear Sala')}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};