import { format } from 'date-fns';
import { TrashIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

export interface Solicitud {
  nombre: string;
  title: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  planIds: number[];
  estado: 'nueva';
  valida?: boolean;
  grabar: boolean;
}

interface SolicitudListProps {
  solicitudes: Solicitud[];
  onDelete: (index: number) => void;
  onToggleGrabar: (index: number) => void;
}

export const SolicitudList = ({ solicitudes, onDelete, onToggleGrabar }: SolicitudListProps) => {
  if (solicitudes.length === 0) {
    return (
      <div className="mt-4 text-center py-6 bg-gray-50 rounded-lg">
        <p className="text-gray-400 text-sm">No hay solicitudes</p>
      </div>
    );
  }

  return (
    <div className="mt-4 h-120 w-85">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-semibold text-gray-700">
          Solicitudes ({solicitudes.length})
        </h3>
      </div>
      <div className="space-y-2">
        {solicitudes.map((solicitud, idx) => (
          <div key={idx} className={`bg-gray-50 rounded p-3 text-sm border-2 ${solicitud.valida !== undefined ? solicitud.valida ? 'border-success' : 'border-error' : 'border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium text-gray-800">
                  {solicitud.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {format(solicitud.fecha_inicio, 'dd/MM/yyyy HH:mm')} - {format(solicitud.fecha_fin, 'dd/MM/yyyy HH:mm')}
                </div>
              </div>
              
              <button
                  onClick={() => onToggleGrabar(idx)}
                  className={solicitud.grabar ? 'text-success' : 'text-gray-400'}
                  title={solicitud.grabar ? 'Desactivar grabación' : 'Activar grabación'}
              >
                  <VideoCameraIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDelete(idx)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Eliminar solicitud"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};