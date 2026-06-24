import z from 'zod';

const MAX_CENTAVOS = 2147483647; 
const MAX_TASA = 2147483647;

const cambiosSchema = z.object({
    planId: z.number().int().positive().max(MAX_CENTAVOS),
    tipo: z.enum(['sala']),
    nuevaTarifa: z.int().positive().max(MAX_CENTAVOS, `Máximo ${MAX_CENTAVOS} centavos`)
})

export const tarifasSchema = z.object({
    cambios: z.array(cambiosSchema),
    nuevaTasa: z.number().int().positive().max(MAX_TASA, `Máximo ${MAX_TASA}`).optional(),
}).refine(
    (data) => data.cambios.length > 0 || data.nuevaTasa !== undefined,
    { message: 'Debe haber al menos un cambio o una nueva tasa' }
);