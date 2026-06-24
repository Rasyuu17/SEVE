export interface Documento {
  id: number;
  numero: number;
  direccion_original: string | null;
  direccion_firmado: string | null;
  id_contratoGeneral: number;
  id_contratoEspecifico: number;
  nombre_solicitante: string;
  entidad: string;
  correo: string;
  estado: string;
  tipo: 'solicitud_sala';
  createdAt: string;
  updatedAt: string;
}

export interface DocumentoFilters {
  search?: string;
  entidad?: string;
  nombre_solicitante?: string;
  correo?: string;
  id_contratoGeneral?: string;
  id_contratoEspecifico?: string;
  numero?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  limit?: number;
}