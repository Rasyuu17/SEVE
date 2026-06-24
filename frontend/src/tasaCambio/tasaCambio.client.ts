import type { CreateTasaRequest, TasaCambio } from './tasaCambio.interface';

import api from '../apiClient/api';

export const tasaApi = {
  crear: (data: CreateTasaRequest) => api.post<TasaCambio>('/tasa', data),
  obtenerActiva: () => api.get<TasaCambio>('/tasa/activa'),
  obtenerHistorico: (page: number = 1, limit: number = 10) =>
    api.get<{ rows: TasaCambio[]; count: number }>(`/tasa/historico?page=${page}&limit=${limit}`),
  aplicarCambios: (data: any) => api.post('/tasa/tarifas', data),
  obtenerTasa: (id: number) => api.get(`/tasa/${id}`),
};