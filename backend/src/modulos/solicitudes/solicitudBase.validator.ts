// solicitudBase.validator.ts
import z from 'zod';

export const solicitudBaseSchema = z.object({
  fecha_inicio: z.date('La fecha de inicio es requerida'),
  fecha_fin: z.date('La fecha de fin es requerida'),
  estado: z.enum(['pendiente', 'aceptado', 'anulado', 'cancelado', 'por facturar', 'facturado', 'vencido', 'causa mayor']).default('pendiente'),
  confirmado: z.boolean().default(false),
  factura: z.string().length(8, 'Debe tener 8 dígitos').optional()
});

export type SolicitudBaseType = z.infer<typeof solicitudBaseSchema>;