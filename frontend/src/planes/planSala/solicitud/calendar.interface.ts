export interface CalendarItem {
  fecha_inicio: Date;
  fecha_fin: Date;
  estado: 'aceptado' | 'pendiente' | 'nueva';
  title?: string;
}

export interface SolicitudCalendar {
  fecha_inicio: Date;
  fecha_fin: Date;
  planIds: number[];
}

export interface Solicitud {
  id?: number;
  titulo: string;
  descripcion: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  planIds: number[];
  estado: 'pendiente' | 'aceptado' | 'rechazada';
  createdAt?: Date;
  grabar: boolean;
}

export interface BulkSolicitud {
  titulo: string;
  descripcion: string;
  planIds: number[];
  recurrencia: {
    tipo: 'semanal' | 'mensual_por_dias' | 'mensual_por_semana';
    diasSemana?: number[];
    diasMes?: number[];
    semana?: number;
    diaSemana?: number;
    fechaInicio: Date;
    fechaFin: Date;
    horaInicio: string;
    horaFin: string;
  } | null;
}