import type { Sala, SalaType } from './sala.interface';

import api from '../../../apiClient/api';

export const salaApi = {
  crear: (data: SalaType) => api.post<Sala>('/sala', data),
  listarDisponibles: () => api.get<Sala[]>('/sala/disponibles'),
  listar: () => api.get<Sala[]>('/sala'),
  obtenerPorId: (id: number) => api.get<Sala>(`/sala/${id}`),
  obtenerPorPlan: (id: number) => api.get<Sala[]>(`/sala/${id}/planes`),
  modificar: (id: number, data: SalaType) => api.put<Sala>(`/sala/${id}`, data),
  eliminar: (id: number) => api.delete(`/sala/${id}`),
};