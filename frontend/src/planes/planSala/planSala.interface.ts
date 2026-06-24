import z from 'zod';

import type { PlanBase } from '../planBase.interface';
import { planSalaSchema } from './planSala.validator';
import type { Sala } from './sala/sala.interface';

export interface PlanSala extends PlanBase {
  esIntegrable: boolean;
  esNacional: boolean;
  cantUsuariosLinea: number;
  cantUsuariosInvitados: number;

  tieneVCReunionInteligente: boolean;
  tieneVCTodosPantalla: boolean;
  tieneVCRolesModerados: boolean;
  tieneVCClaseVirtual: boolean;

  tieneColabEdicionAgenda: boolean;
  tieneColabRealizarLlamadas: boolean;
  tieneColabCrearConferencias: boolean;
  tieneColabCompartirPantalla: boolean;
  tieneColabControlRemoto: boolean;
  tieneColabPresentacion: boolean;
  tieneColabEnviarArchivos: boolean;
  tieneColabRecibirArchivos: boolean;
  tieneColabGrabacion: boolean;

  tiempoAlmacenamiento: number;
  almacenamientoLocal: boolean;

  SalaModels?: Sala[];
  PlanBaseModel?: PlanBase;
}

export type PlanSalaType = z.infer<typeof planSalaSchema>;

export interface CreatePlanSalaRequest extends PlanSalaType {
  tipo: 'sala';
}