import type { CalendarItem } from './calendar.interface';
import type { CreateSolicitudType } from './salaCalendar';

import api from '../../../apiClient/api';

export const solicitudApi = {
  obtenerPorMes: (year: number, month: number, name: string) =>
    api.get<{ success: boolean; data: CalendarItem[] }>(`solicitud/sala/${name}/${month}/${year}`),
  obtenerCalendarioOperativo: (month: number, year: number) =>
    api.get(`/solicitud/sala/calendario-operativo/${month}/${year}`),
  validarDisponibilidad: (nombre: string[], fecha_inicio: Date[], fecha_fin: Date[]) =>
    api.post<{ success: boolean; data: { nombre: string; valido: boolean }[] }>('solicitud/sala/disponibilidad', {
      nombre: nombre,
      fecha_inicio: fecha_inicio,
      fecha_fin: fecha_fin,
    }),
  solicitar: (data: CreateSolicitudType) => api.post('solicitud/sala/', data),
  obtenerPorDocumento: (documentoId: number) => api.get(`solicitud/sala/documento/${documentoId}`),
  cancelar: (id: number) => api.put(`solicitud/sala/${id}/cancelar`),
  cancelarPorDocumento: (documentoId: number) => api.put(`solicitud/sala/documento/${documentoId}/cancelar`),
};