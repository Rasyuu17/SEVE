import type { CreatePlanSalaRequest, PlanSala } from './planSala.interface';

import api from '../../apiClient/api';

export const planApi = {
  crearSala: (data: CreatePlanSalaRequest) => api.post<PlanSala>('/plan', data),
  listar: () => api.get<PlanSala[]>('/plan?tipo=sala'),
  obtenerPorId: (id: number) => api.get<PlanSala>(`/plan/sala/${id}`),
  modificar: (id: number, data: Partial<CreatePlanSalaRequest>) => api.put<PlanSala>(`/plan/sala/${id}`, data),
  eliminar: (id: number) => api.delete<PlanSala>(`/plan/sala/${id}`),
};