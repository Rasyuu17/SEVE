import { useEffect, useState } from 'react';

import { planApi } from '../planSala.client';
import type { PlanSala } from '../planSala.interface';

interface PlanCombinadoCardProps {
  planesIntegrables?: PlanSala[];
  onSelect?: (planes: PlanSala[]) => void;
}

export const PlanCombinadoCard = ({ planesIntegrables: planesIntegrablesProp = [], onSelect }: PlanCombinadoCardProps) => {
  const [planesIntegrables, setPlanesIntegrables] = useState<PlanSala[]>(planesIntegrablesProp);
  const [selectedPlanes, setSelectedPlanes] = useState<PlanSala[]>([]);
  const [combinadoInfo, setCombinadoInfo] = useState<any>(null);

  const handleTogglePlan = (plan: PlanSala) => {
    setSelectedPlanes(prev => {
      const exists = prev.some(p => p.id === plan.id);
      if (exists) {
        return prev.filter(p => p.id !== plan.id);
      } else {
        return [...prev, plan];
      }
    });
  };

  useEffect(() => {
    if (selectedPlanes.length === 0) {
      setCombinadoInfo(null);
      return;
    }

    const tarifaTotal = selectedPlanes.reduce((sum, p) => sum + (p.PlanBaseModel?.tarifa || 0), 0);
    const usuariosLineaTotal = selectedPlanes.reduce((sum, p) => sum + p.cantUsuariosLinea, 0);
    const usuariosInvitadosTotal = selectedPlanes.reduce((sum, p) => sum + p.cantUsuariosInvitados, 0);

    const tieneVCReunionInteligente = selectedPlanes.some(p => p.tieneVCReunionInteligente);
    const tieneVCTodosPantalla = selectedPlanes.some(p => p.tieneVCTodosPantalla);
    const tieneVCRolesModerados = selectedPlanes.some(p => p.tieneVCRolesModerados);
    const tieneVCClaseVirtual = selectedPlanes.some(p => p.tieneVCClaseVirtual);

    const tieneColabEdicionAgenda = selectedPlanes.some(p => p.tieneColabEdicionAgenda);
    const tieneColabRealizarLlamadas = selectedPlanes.some(p => p.tieneColabRealizarLlamadas);
    const tieneColabCrearConferencias = selectedPlanes.some(p => p.tieneColabCrearConferencias);
    const tieneColabCompartirPantalla = selectedPlanes.some(p => p.tieneColabCompartirPantalla);
    const tieneColabControlRemoto = selectedPlanes.some(p => p.tieneColabControlRemoto);
    const tieneColabPresentacion = selectedPlanes.some(p => p.tieneColabPresentacion);
    const tieneColabEnviarArchivos = selectedPlanes.some(p => p.tieneColabEnviarArchivos);
    const tieneColabRecibirArchivos = selectedPlanes.some(p => p.tieneColabRecibirArchivos);
    const tieneColabGrabacion = selectedPlanes.some(p => p.tieneColabGrabacion);

    setCombinadoInfo({
      tarifaTotal,
      usuariosLineaTotal,
      usuariosInvitadosTotal,
      tieneVCReunionInteligente,
      tieneVCTodosPantalla,
      tieneVCRolesModerados,
      tieneVCClaseVirtual,
      tieneColabEdicionAgenda,
      tieneColabRealizarLlamadas,
      tieneColabCrearConferencias,
      tieneColabCompartirPantalla,
      tieneColabControlRemoto,
      tieneColabPresentacion,
      tieneColabEnviarArchivos,
      tieneColabRecibirArchivos,
      tieneColabGrabacion,
      cantidadPlanes: selectedPlanes.length,
      planes: selectedPlanes,
    });
  }, [selectedPlanes]);

  const handleSeleccionarCombinado = () => {
    if (onSelect && selectedPlanes.length > 0) {
      onSelect(selectedPlanes);
    }
  };

  return (
    <div className="bg-linear-to-r from-sky-50 to-primary-light rounded-xl shadow-lg p-6 border-2 border-purple-200">
      <h2 className="text-2xl font-bold text-primary-dark mb-4">Plan Combinado</h2>

      <div className='grid gap-2 grid-cols-3'>
        <div className="mb-6 w-full h-full col-span-1">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Selecciona los planes a combinar:</h3>
          <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
            {planesIntegrables.map(plan => (
              <label key={plan.id} className="flex items-center gap-2 p-2 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPlanes.some(p => p.id === plan.id)}
                  onChange={() => handleTogglePlan(plan)}
                  className="w-4 h-4 accent-primary-dark"
                />
                <span className="text-sm font-medium">{plan.PlanBaseModel?.nombre}</span>
              </label>
            ))}
          </div>
          {planesIntegrables.length === 0 && (
            <p className="text-gray-500 text-center py-4">No hay planes integrables disponibles</p>
          )}
        </div>

        {combinadoInfo && (
          <div className="bg-white rounded-lg p-4 mb-4 shadow-inner col-span-2">
            <h3 className="font-bold text-lg text-primary-dark mb-3">Vista previa del combinado:</h3>

            <div className="space-y-2 border-b pb-3">
              <div className="flex justify-between">
                <span>Planes incluidos:</span>
                <span className="font-bold">{combinadoInfo.cantidadPlanes}</span>
              </div>
              <div className="flex justify-between">
                <span>Tarifa total:</span>
                <span className="text-2xl font-bold text-green-600">${(combinadoInfo.tarifaTotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Usuarios en línea total:</span>
                <span>{combinadoInfo.usuariosLineaTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Usuarios invitados total:</span>
                <span>{combinadoInfo.usuariosInvitadosTotal}</span>
              </div>
            </div>

            <div className="border-b pb-3 mt-3">
              <div className="flex flex-wrap gap-2">
                <p className="text-sm font-semibold mb-2">Videoconferencia:</p>
                {combinadoInfo.tieneVCReunionInteligente && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Reunión inteligente</span>
                )}
                {combinadoInfo.tieneVCTodosPantalla && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Todos en pantalla</span>
                )}
                {combinadoInfo.tieneVCRolesModerados && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Roles moderados</span>
                )}
                {combinadoInfo.tieneVCClaseVirtual && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Clase virtual</span>
                )}
              </div>
              {!combinadoInfo.tieneVCReunionInteligente && !combinadoInfo.tieneVCTodosPantalla &&
                !combinadoInfo.tieneVCRolesModerados && !combinadoInfo.tieneVCClaseVirtual && (
                <span className="text-xs text-gray-400">Ninguna</span>
              )}
            </div>

            <div className="pt-3">
              <div className="flex flex-wrap gap-2">
                <p className="text-sm font-semibold mb-2">Herramientas de colaboración:</p>
                {combinadoInfo.tieneColabEdicionAgenda && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Edición agenda</span>
                )}
                {combinadoInfo.tieneColabRealizarLlamadas && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Realizar llamadas</span>
                )}
                {combinadoInfo.tieneColabCrearConferencias && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Crear conferencias</span>
                )}
                {combinadoInfo.tieneColabCompartirPantalla && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Compartir pantalla</span>
                )}
                {combinadoInfo.tieneColabControlRemoto && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Control remoto</span>
                )}
                {combinadoInfo.tieneColabPresentacion && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Presentación</span>
                )}
                {combinadoInfo.tieneColabEnviarArchivos && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Enviar archivos</span>
                )}
                {combinadoInfo.tieneColabRecibirArchivos && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Recibir archivos</span>
                )}
                {combinadoInfo.tieneColabGrabacion && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Grabación</span>
                )}
              </div>
            </div>
            <button
              onClick={handleSeleccionarCombinado}
              className="w-full bg-primary-dark text-white py-3 rounded-lg hover:bg-primary-extradark transition-colors mt-4"
            >
              Seleccionar Combinado
            </button>
          </div>
        )}
      </div>
    </div>
  );
};