import z from 'zod';

export const tasaCambioSchema = z.object({
  tasa: z.int('La tasa debe ser un valor entero').positive(),
});

export type TasaCambioType = z.infer<typeof tasaCambioSchema>;