import z from 'zod';

const MAX_NOMBRE = 100;
const MAX_TARIFA_CENTAVOS = 2147483647;

export const planBaseSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(MAX_NOMBRE, `Máximo ${MAX_NOMBRE} caracteres`),
    normalizacionTiempo: z.enum(['hora', 'dia', 'mes'], { message: 'La forma de normalizar el tiempo es requerida' }),
    tarifa: z.number({ message: 'El valor de la tarifa es requerido' }).int().positive('La tarifa debe ser positiva').max(MAX_TARIFA_CENTAVOS, `Máximo ${MAX_TARIFA_CENTAVOS} centavos`),
    categoriaAnexable: z.enum(['sala', 'autogestionado y eventos', 'valor agregado'], { message: 'Categoría requerida' }),
});

export type PlanBaseType = z.infer<typeof planBaseSchema>;