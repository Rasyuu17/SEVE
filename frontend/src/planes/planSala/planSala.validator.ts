import z from 'zod';
import { planBaseSchema } from '../planBase.validator';

const MAX_USUARIOS = 10000;

export const planSalaSchema = planBaseSchema.extend({
  esIntegrable: z.boolean(),
  esNacional: z.boolean(),
  cantUsuariosLinea: z.number('El campo es requerido').int().min(1, 'Debe haber al menos 1 usuario en línea').max(MAX_USUARIOS, `Máximo ${MAX_USUARIOS} usuarios`),
  cantUsuariosInvitados: z.number('El campo es requerido').int().min(1, 'Debe haber al menos 1 usuario invitado').max(MAX_USUARIOS, `Máximo ${MAX_USUARIOS} usuarios`),

  tieneVCReunionInteligente: z.boolean(),
  tieneVCTodosPantalla: z.boolean(),
  tieneVCRolesModerados: z.boolean(),
  tieneVCClaseVirtual: z.boolean(),

  tieneColabEdicionAgenda: z.boolean(),
  tieneColabRealizarLlamadas: z.boolean(),
  tieneColabCrearConferencias: z.boolean(),
  tieneColabCompartirPantalla: z.boolean(),
  tieneColabControlRemoto: z.boolean(),
  tieneColabPresentacion: z.boolean(),
  tieneColabEnviarArchivos: z.boolean(),
  tieneColabRecibirArchivos: z.boolean(),
  tieneColabGrabacion: z.boolean(),

  tiempoAlmacenamiento: z.number('El campo es requerido').min(0, 'El tiempo no puede ser negativo').max(8760, 'Máximo 8760 horas (1 año)'),
  almacenamientoLocal: z.boolean(),

  extras: z.object({
    salas_ids: z.array(z.number()).optional(),
  }).optional(),
});

export type PlanSalaType = z.infer<typeof planSalaSchema>;