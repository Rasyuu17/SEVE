import api from '../../../apiClient/api';
import type { PlanCombinado } from './planCombinado.interface';

export const planCombinadoApi = {
    crear: (planes: number[]) => api.post<PlanCombinado>('/planes/combinado', { planes }),
    obtenerPorId: (id: number) => api.get<PlanCombinado>(`/planes/combinado/${id}`)
};