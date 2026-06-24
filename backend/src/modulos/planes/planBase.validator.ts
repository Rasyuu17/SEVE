import z from 'zod';

const MAX_NOMBRE = 100;
const MAX_TARIFA_CENTAVOS = 2147483647;

export const planBaseSchema = z.object({
    nombre: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres').max(MAX_NOMBRE, `Máximo ${MAX_NOMBRE} caracteres`),
    normalizacionTiempo: z.enum(['hora', 'dia', 'mes'], { message: 'Seleccione una opción' }),
    tarifa: z.number().int().positive('La tarifa debe ser positiva').max(MAX_TARIFA_CENTAVOS, `Máximo ${MAX_TARIFA_CENTAVOS} centavos`),
    categoriaAnexable: z.enum(['sala', 'autogestionado y eventos', 'valor agregado'], { message: 'Seleccione una categoría' }),
});

export type PlanBaseType = z.infer<typeof planBaseSchema>;