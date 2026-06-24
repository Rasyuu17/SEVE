import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { planApi } from './planSala.client';
import type { PlanSalaType } from './planSala.interface';
import { planSalaSchema } from './planSala.validator';
import { salaApi } from './sala/sala.client';
import type { Sala } from './sala/sala.interface';

interface PlanSalaFormProps {
  initialData?: PlanSalaType & { id: number };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const FieldError = ({ error }: { error?: { message?: string } }) =>
  error?.message ? <p className="text-error text-xs mt-1">{error.message}</p> : null;

export const PlanSalaForm = ({ initialData, onSuccess, onCancel }: PlanSalaFormProps) => {
  const isEditing = !!initialData;
  const [salasDisponibles, setSalasDisponibles] = useState<Sala[]>([]);
  const [selectedSalas, setSelectedSalas] = useState<number[]>(initialData?.extras?.salas_ids || []);
  const [selectedSalasInfo, setSelectedSalasInfo] = useState<Sala[]>([]);

  const { control, register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<PlanSalaType>({
    resolver: zodResolver(planSalaSchema),
    defaultValues: {
      nombre: initialData?.nombre || '',
      normalizacionTiempo: initialData?.normalizacionTiempo || 'hora',
      tarifa: initialData?.tarifa || 0,
      categoriaAnexable: initialData?.categoriaAnexable || 'sala',
      esIntegrable: initialData?.esIntegrable ?? false,
      esNacional: initialData?.esNacional ?? true,
      cantUsuariosLinea: initialData?.cantUsuariosLinea || 0,
      cantUsuariosInvitados: initialData?.cantUsuariosInvitados || 0,
      tieneVCReunionInteligente: initialData?.tieneVCReunionInteligente || false,
      tieneVCTodosPantalla: initialData?.tieneVCTodosPantalla || false,
      tieneVCRolesModerados: initialData?.tieneVCRolesModerados || false,
      tieneVCClaseVirtual: initialData?.tieneVCClaseVirtual || false,
      tieneColabEdicionAgenda: initialData?.tieneColabEdicionAgenda || false,
      tieneColabRealizarLlamadas: initialData?.tieneColabRealizarLlamadas || false,
      tieneColabCrearConferencias: initialData?.tieneColabCrearConferencias || false,
      tieneColabCompartirPantalla: initialData?.tieneColabCompartirPantalla || false,
      tieneColabControlRemoto: initialData?.tieneColabControlRemoto || false,
      tieneColabPresentacion: initialData?.tieneColabPresentacion || false,
      tieneColabEnviarArchivos: initialData?.tieneColabEnviarArchivos || false,
      tieneColabRecibirArchivos: initialData?.tieneColabRecibirArchivos || false,
      tieneColabGrabacion: initialData?.tieneColabGrabacion || false,
      tiempoAlmacenamiento: initialData?.tiempoAlmacenamiento || 0,
      almacenamientoLocal: initialData?.almacenamientoLocal || false,
      extras: { salas_ids: initialData?.extras?.salas_ids || [] },
    },
  });

  const cargarSalas = async () => {
    try {
      const response = await salaApi.listarDisponibles();
      if (initialData) {
        const selectedSalas = await salaApi.obtenerPorPlan(initialData.id);
        setSelectedSalasInfo(selectedSalas.data);
      }
      setSalasDisponibles(response.data);
    } catch (error) {
      toast.error('Error al cargar salas:' + error);
    }
  };

  useEffect(() => {
    cargarSalas();
  }, []);

  const handleSalaToggle = (salaId: number) => {
    const newSelection = selectedSalas.includes(salaId)
      ? selectedSalas.filter(id => id !== salaId)
      : [...selectedSalas, salaId];
    setSelectedSalas(newSelection);
    setValue('extras.salas_ids', newSelection);
  };

  const onSubmit = async (data: PlanSalaType) => {
    try {
      if (isEditing) {
        await planApi.modificar(initialData.id, {
          ...data,
          extras: { salas_ids: selectedSalas },
        });
        toast.success('Plan actualizado');
      } else {
        await planApi.crearSala({
          tipo: 'sala',
          ...data,
          extras: { salas_ids: selectedSalas },
        });
        toast.success('Plan creado exitosamente');
      }

      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar el plan');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 pt-0">
      <h2 className="mb-4 sticky flex justify-between pt-2 top-16 bg-white">
        <span className='text-xl font-bold'>{isEditing ? 'Editar Plan Sala' : 'Crear Plan Sala'}</span>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
            Cancelar
          </button>
        )}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Datos Básicos */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-3 text-primary-dark">Datos Básicos</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input {...register('nombre')} disabled={isEditing} name="nombre"
                className={`w-full px-3 py-2 border rounded-md ${isEditing ? 'bg-gray-100 text-gray-500' : ''}`} />
              <FieldError error={errors.nombre} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarifa</label>
              <Controller name="tarifa" control={control} render={({ field }) => (
                <input disabled={isEditing} type="number" step="0.01" name="tarifa"
                  value={field.value ? (field.value / 100) : ''}
                  onChange={(e) => {
                    const floatValue = parseFloat(e.target.value);
                    const centavos = Math.round(floatValue * 100);
                    field.onChange(centavos);
                  }}
                  className={`w-full px-3 py-2 border rounded-md ${isEditing ? 'bg-gray-100 text-gray-500' : ''}`} />
              )} />
              <FieldError error={errors.tarifa} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Normalización Tiempo</label>
              <select {...register('normalizacionTiempo')} className="w-full px-3 py-2 border rounded-md">
                <option value="hora">Hora</option>
                <option value="dia">Día</option>
                <option value="mes">Mes</option>
              </select>
              <FieldError error={errors.normalizacionTiempo} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría Anexable</label>
              <select {...register('categoriaAnexable')} className="w-full px-3 py-2 border rounded-md">
                <option value="sala">Sala</option>
                <option value="autogestionado y eventos">Autogestionado y Eventos</option>
                <option value="valor agregado">Valor Agregado</option>
              </select>
              <FieldError error={errors.categoriaAnexable} />
            </div>

            <div className="items-center gap-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('esNacional')} />
                <span className="text-sm font-medium text-gray-700">¿Es Nacional?</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('esIntegrable')} />
                <span className="text-sm font-medium text-gray-700">¿Es Integrable?</span>
              </label>
            </div>
          </div>
        </div>

        {/* Capacidad */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-3 text-primary-dark">Capacidad</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuarios en Línea</label>
              <input type="number" {...register('cantUsuariosLinea', { setValueAs: (v) => v === '' ? 0 : Number(v) })} className="w-full px-3 py-2 border rounded-md" />
              <FieldError error={errors.cantUsuariosLinea} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuarios Invitados</label>
              <input type="number" {...register('cantUsuariosInvitados', { setValueAs: (v) => v === '' ? 0 : Number(v) })} className="w-full px-3 py-2 border rounded-md" />
              <FieldError error={errors.cantUsuariosInvitados} />
            </div>
          </div>
        </div>

        {/* Tipos de Videoconferencia */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-3 text-primary-dark">Tipos de Videoconferencia</h3>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2"><input type="checkbox" {...register('tieneVCReunionInteligente')} />Reunión Inteligente</label>
            <label className="flex items-center gap-2"><input type="checkbox" {...register('tieneVCTodosPantalla')} />Todos en Pantalla</label>
            <label className="flex items-center gap-2"><input type="checkbox" {...register('tieneVCRolesModerados')} />Roles Moderados</label>
            <label className="flex items-center gap-2"><input type="checkbox" {...register('tieneVCClaseVirtual')} />Clase Virtual</label>
          </div>
        </div>

        {/* Herramientas de Colaboración */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-3 text-primary-dark">Herramientas de Colaboración</h3>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2"><input type="checkbox" {...register('tieneColabEdicionAgenda')} />Edición de Agenda</label>
            <label className="flex items-center gap-2"><input type="checkbox" {...register('tieneColabRealizarLlamadas')} />Realizar Llamadas</label>
            <label className="flex items-center gap-2"><input type="checkbox" {...register('tieneColabCrearConferencias')} />Crear Conferencias</label>
            <label className="flex items-center gap-2"><input type="checkbox" {...register('tieneColabCompartirPantalla')} />Compartir Pantalla</label>
            <label className="flex items-center gap-2"><input type="checkbox" {...register('tieneColabControlRemoto')} />Control Remoto</label>
            <label className="flex items-center gap-2"><input type="checkbox" {...register('tieneColabPresentacion')} />Presentación</label>
            <label className="flex items-center gap-2"><input type="checkbox" {...register('tieneColabEnviarArchivos')} />Enviar Archivos</label>
            <label className="flex items-center gap-2"><input type="checkbox" {...register('tieneColabRecibirArchivos')} />Recibir Archivos</label>
            <label className="flex items-center gap-2"><input type="checkbox" {...register('tieneColabGrabacion')} />Grabación</label>
          </div>
        </div>

        {/* Almacenamiento */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-3 text-primary-dark">Almacenamiento</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo Almacenamiento (días)</label>
              <input type="number" {...register('tiempoAlmacenamiento', { setValueAs: (v) => v === '' ? 0 : Number(v) })} className="w-full px-3 py-2 border rounded-md" />
              <FieldError error={errors.tiempoAlmacenamiento} />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('almacenamientoLocal')} />
                Almacenamiento Local
              </label>
            </div>
          </div>
        </div>

        {/* Salas Asociadas */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-3 text-primary-dark">Salas Asociadas</h3>
          {salasDisponibles.length === 0 && !isEditing ? (
            <p className="text-gray-500">No hay salas disponibles</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {[...salasDisponibles, ...(initialData?.extras?.salas_ids?.map(id => {
                const salaExistente = salasDisponibles.find(s => s.id === id);
                if (salaExistente) return null;
                const salaInfo = selectedSalasInfo.find(s => s.id === id);
                return { id, nombre: salaInfo?.nombre, ubicacion: salaInfo?.ubicacion } as Sala;
              }).filter(Boolean) as Sala[] || [])]
                .filter((sala, index, self) => self.findIndex(s => s.id === sala.id) === index)
                .map(sala => (
                  <label key={sala.id} className="flex items-center gap-2">
                    <input type="checkbox" checked={selectedSalas.includes(sala.id)} onChange={() => handleSalaToggle(sala.id)} />
                    {sala.nombre} - {sala.ubicacion}
                  </label>
                ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={isSubmitting}
            className="flex-1 bg-primary-dark text-white py-2 px-4 rounded-md hover:bg-primary transition-colors">
            {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar Plan' : 'Crear Plan Sala')}
          </button>
        </div>
      </form>
    </div>
  );
};