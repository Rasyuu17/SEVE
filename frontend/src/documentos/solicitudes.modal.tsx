import { useEffect, useState } from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import ModalComponent from '../components/Modal';
import Pagination from '../utils/pagination';
import { solicitudApi } from '../planes/planSala/solicitud/solicitudSala.client';
import type { Documento } from './documentos.interface';
import { formatDate } from './documentos.utils';
import { tasaApi } from '../tasaCambio/tasaCambio.client';

interface Props {
  documento: Documento;
  onClose: () => void;
  onUpdate?: () => void;
}

export function SolicitudesModal({ documento, onClose, onUpdate }: Props) {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    titulo: string;
    mensaje: string;
    onConfirm: () => void;
  }>({ open: false, titulo: '', mensaje: '', onConfirm: () => {} });

  const abrirConfirmacion = (titulo: string, mensaje: string, onConfirm: () => void) => {
    setConfirmModal({ open: true, titulo, mensaje, onConfirm });
  };

  const cargarSolicitudes = async () => {
    try {
      const response = await solicitudApi.obtenerPorDocumento(documento.id);
      setSolicitudes(response.data.data);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, [documento.id]);

  const handleCancelarSolicitud = (id: number) => {
    abrirConfirmacion(
      'Cancelar solicitud',
      '¿Está seguro de cancelar esta solicitud?',
      async () => {
        try {
          await solicitudApi.cancelar(id);
          toast.success('Solicitud cancelada');
          cargarSolicitudes();
          onUpdate?.();
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Error al cancelar');
        }
      }
    );
  };

  const handleCancelarTodas = () => {
    abrirConfirmacion(
      'Cancelar todas las solicitudes',
      '¿Está seguro de cancelar todas las solicitudes de este documento?',
      async () => {
        try {
          await solicitudApi.cancelarPorDocumento(documento.id);
          toast.success('Todas las solicitudes canceladas');
          cargarSolicitudes();
          onUpdate?.();
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Error al cancelar');
        }
      }
    );
  };

  const sePuedeCancelar = (estado: string) => {
    return estado === 'pendiente' || estado === 'aceptado';
  };

  const hayCancelables = solicitudes.some(sol =>
    sePuedeCancelar(sol.SolicitudBaseModel?.estado)
  );

  const renderSolicitudes = () => {
    switch (documento.tipo) {
      case 'solicitud_sala':
        return (
          <SolicitudesSalaTabla
            solicitudes={solicitudes}
            onCancelar={handleCancelarSolicitud}
            sePuedeCancelar={sePuedeCancelar}
          />
        );
      default:
        return <p className="text-gray-500">Tipo de solicitud no reconocido</p>;
    }
  };

  return (
    <ModalComponent
      isOpen={true}
      onClose={onClose}
      title={`Solicitudes - ${documento.entidad}`}
    >
      <div className="w-225 max-h-125 overflow-auto">
        {loading ? (
          <p className="text-gray-500">Cargando solicitudes...</p>
        ) : (
          <>
            {hayCancelables && (
              <div className="mb-3">
                <button
                  onClick={handleCancelarTodas}
                  className="text-sm text-error hover:text-red-800 underline"
                >
                  Cancelar todas las solicitudes
                </button>
              </div>
            )}
            {renderSolicitudes()}
          </>
        )}
      </div>

      <ModalComponent
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
        title={confirmModal.titulo}
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-gray-600">{confirmModal.mensaje}</p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                confirmModal.onConfirm();
                setConfirmModal(prev => ({ ...prev, open: false }));
              }}
              className="bg-error text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Confirmar
            </button>
            <button
              onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
              className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </ModalComponent>
    </ModalComponent>
  );
}

function SolicitudesSalaTabla({
  solicitudes,
  onCancelar,
  sePuedeCancelar,
}: {
  solicitudes: any[];
  onCancelar: (id: number) => void;
  sePuedeCancelar: (estado: string) => boolean;
}) {
  const [page, setPage] = useState(1);
  const limit = 5;
  const totalPages = Math.ceil(solicitudes.length / limit);
  const paginadas = solicitudes.slice((page - 1) * limit, page * limit);
  const [tasasCombinados, setTasasCombinados] = useState<Record<number, number>>({});

  useEffect(() => {
    const cargarTasas = async () => {
      const nuevasTasas: Record<number, number> = {};
      for (const sol of solicitudes) {
        if (sol.PlanCombinadoModel?.PlanSalaModels) {
          for (const ps of sol.PlanCombinadoModel.PlanSalaModels) {
            const fk = ps.PlanBaseModel?.tasa_fk;
            if (fk && !(fk in nuevasTasas) && !(fk in tasasCombinados)) {
              try {
                const res = await tasaApi.obtenerTasa(fk);
                nuevasTasas[fk] = res.data.tasa;
              } catch {}
            }
          }
        }
      }
      if (Object.keys(nuevasTasas).length > 0) {
        setTasasCombinados(prev => ({ ...prev, ...nuevasTasas }));
      }
    };
    cargarTasas();
  }, [solicitudes]);

  if (solicitudes.length === 0) {
    return <p className="text-gray-500">No hay solicitudes asociadas</p>;
  }

  return (
    <div>
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-gray-500 uppercase text-xs">Plan</th>
            <th className="px-3 py-2 text-left text-gray-500 uppercase text-xs">Inicio</th>
            <th className="px-3 py-2 text-left text-gray-500 uppercase text-xs">Fin</th>
            <th className="px-3 py-2 text-left text-gray-500 uppercase text-xs">Tarifa CUP</th>
            <th className="px-3 py-2 text-left text-gray-500 uppercase text-xs">Tarifa USD</th>
            <th className="px-3 py-2 text-left text-gray-500 uppercase text-xs">Estado</th>
            <th className="px-3 py-2 text-left text-gray-500 uppercase text-xs">Confirmación</th>
            <th className="px-3 py-2 text-center text-gray-500 uppercase text-xs w-20">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {paginadas.map((sol, i) => {
            const planSala = sol.PlanSalaModel;
            const planCombinado = sol.PlanCombinadoModel;
            const base = sol.SolicitudBaseModel;

            const nombrePlan = planSala?.PlanBaseModel?.nombre ||
              planCombinado?.PlanSalaModels?.map((p: any) => p.PlanBaseModel?.nombre).join(' + ') ||
              'Sin plan';

            const tarifaCUP = planSala?.PlanBaseModel
              ? (planSala.PlanBaseModel.tarifa / 100).toFixed(2)
              : planCombinado?.PlanSalaModels
                  ? (planCombinado.PlanSalaModels.reduce((sum: number, p: any) => sum + (p.PlanBaseModel?.tarifa || 0), 0) / 100).toFixed(2)
                  : '0';

            const tasa = planSala?.PlanBaseModel?.TasaCambioModel?.tasa 
              || (planCombinado?.PlanSalaModels?.[0]?.PlanBaseModel?.tasa_fk 
                  ? tasasCombinados[planCombinado.PlanSalaModels[0].PlanBaseModel.tasa_fk] 
                  : undefined)
              || 100;

            const tarifaUSD = planSala?.PlanBaseModel
              ? (planSala.PlanBaseModel.tarifa / tasa).toFixed(2)
              : planCombinado?.PlanSalaModels
                  ? (planCombinado.PlanSalaModels.reduce((sum: number, p: any) => sum + (p.PlanBaseModel?.tarifa || 0), 0) / tasa).toFixed(2)
                  : 'Varía';

            return (
              <tr key={i}>
                <td className="px-3 py-2">{nombrePlan}</td>
                <td className="px-3 py-2">{formatDate(base?.fecha_inicio)}</td>
                <td className="px-3 py-2">{formatDate(base?.fecha_fin)}</td>
                <td className="px-3 py-2">${tarifaCUP}</td>
                <td className="px-3 py-2">${tarifaUSD}</td>
                <td className="px-3 py-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    base?.estado === 'aceptado' ? 'bg-success/20 text-success' :
                    base?.estado === 'pendiente' ? 'bg-warning/20 text-warning' :
                    base?.estado === 'cancelado' || base?.estado === 'anulado' ? 'bg-error/20 text-error' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {base?.estado}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {base?.confirmado === false ? (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warning/20 text-warning">
                      Por confirmar
                    </span>
                  ):(
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/20 text-success">
                      Confirmado
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  {sePuedeCancelar(base?.estado) && (
                    <button
                      onClick={() => onCancelar(base.id)}
                      className="text-error hover:text-red-700"
                      title="Cancelar solicitud"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-3 pt-3 border-t">
          <span className="text-xs text-gray-500">
            {solicitudes.length} solicitudes
          </span>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}