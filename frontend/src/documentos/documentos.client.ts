import api from '../apiClient/api';

export const documentoApi = {
  buscar: (params: Record<string, string>) => api.get('documentos', { params }),
  eliminar: (id: number) => api.delete(`documentos/${id}`),
  subirFirmado: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`documentos/${id}/firmar`, formData, {
      headers: { 'Content-Type': undefined },
    });
  },
  descargar: (id: number, firmado: boolean = false) => api.get(`documentos/${id}/descargar`, {
    params: { firmado },
    responseType: 'blob',
  }),
  confirmar: (id: number, tipo: string) => api.put(`documentos/${id}/${tipo}/confirmar`)
};