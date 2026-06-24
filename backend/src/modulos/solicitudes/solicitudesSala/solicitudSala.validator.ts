// solicitudSala.validator.ts
import z from 'zod';

export const solicitudSalaSchema = z.object({
  id_planSala: z.optional(z.number('El identificador del plan a anexar debe ser especificado').int().positive().max(2147483647)),
  id_planCombinado: z.optional(z.number('El identificador del plan a anexar debe ser especificado').int().positive().max(2147483647)),
  link_vc: z.string('El identificador de la conferencia es requerido').min(3).max(500),
  grabar: z.boolean().default(false)
}).refine(data => !!data.id_planSala !== !!data.id_planCombinado, {
  error: 'Error de asignación del plan',
  path: ['id_planSala'],
});

export type SolicitudSalaType = z.infer<typeof solicitudSalaSchema>;