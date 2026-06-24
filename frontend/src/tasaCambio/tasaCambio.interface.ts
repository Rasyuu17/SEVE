export interface TasaCambio {
  id: number;
  tasa: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateTasaRequest {
  tasa: number;
}

export interface Plan {
  id: number,
  nombre: string,
  tarifa: number
}

export interface CambioTarifaForm {
    nuevaTasa?: number | null;
    planes: {
        planId: number;
        tarifaActual: number;
        nuevaTarifa: number | null;
    }[];
}