import { z } from 'zod';

export const documentoFilterSchema = z.object({
  numero: z.string().optional().transform(val => val ? Number(val) : undefined).pipe(z.number().int().positive().optional()),
  nombre_solicitante: z.string().trim().max(255).optional(),
  entidad: z.string().trim().max(255).optional(),
  correo: z.email().trim().max(255).optional().or(z.literal('')),
  id_contratoGeneral: z.string().optional().transform(val => val ? Number(val) : undefined).pipe(z.number().int().positive().optional()),
  id_contratoEspecifico: z.string().optional().transform(val => val ? Number(val) : undefined).pipe(z.number().int().positive().optional()),
  fechaDesde: z.string().optional().or(z.literal('')),
  fechaHasta: z.string().optional().or(z.literal('')),
  search: z.string().trim().max(100, 'La búsqueda no puede exceder 100 caracteres').optional(),
  page: z.string().optional().transform(val => val ? Number(val) : 1).pipe(z.number().int().positive()),
  limit: z.string().optional().transform(val => val ? Number(val) : 7).pipe(z.number().int().min(1).max(100)),
  orderBy: z.enum(['createdAt', 'numero', 'nombre_solicitante', 'entidad']).optional().default('createdAt'),
  orderDir: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});

export type DocumentoFilterInput = z.infer<typeof documentoFilterSchema>;