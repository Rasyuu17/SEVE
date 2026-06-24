import z from 'zod';

import { planBaseSchema } from '../planBase.validator';

const MAX_USUARIOS = 10000;

export const planSalaSchema = z.object({
  esIntegrable: z.boolean(),
  esNacional: z.boolean(),
  cantUsuariosLinea: z.number().int().min(1, 'Debe haber al menos 1 usuario en línea').max(MAX_USUARIOS, `Máximo ${MAX_USUARIOS} usuarios`),
  cantUsuariosInvitados: z.number().int().min(1, 'Debe haber al menos 1 usuario invitado').max(MAX_USUARIOS, `Máximo ${MAX_USUARIOS} usuarios`),

  tieneVCReunionInteligente: z.boolean().default(false),
  tieneVCTodosPantalla: z.boolean().default(false),
  tieneVCRolesModerados: z.boolean().default(false),
  tieneVCClaseVirtual: z.boolean().default(false),

  tieneColabEdicionAgenda: z.boolean().default(false),
  tieneColabRealizarLlamadas: z.boolean().default(false),
  tieneColabCrearConferencias: z.boolean().default(false),
  tieneColabCompartirPantalla: z.boolean().default(false),
  tieneColabControlRemoto: z.boolean().default(false),
  tieneColabPresentacion: z.boolean().default(false),
  tieneColabEnviarArchivos: z.boolean().default(false),
  tieneColabRecibirArchivos: z.boolean().default(false),
  tieneColabGrabacion: z.boolean().default(false),

  tiempoAlmacenamiento: z.number().min(0, 'El tiempo no puede ser negativo').max(8760, 'Máximo 8760 horas (1 año)'),
  almacenamientoLocal: z.boolean().default(false),
});

export type PlanSalaType = z.infer<typeof planSalaSchema>;

export const planSalaUpdateSchema = planBaseSchema.omit({nombre:true,tarifa:true}).extend(planSalaSchema.shape).partial()