import z from 'zod';

const MAX_NOMBRE = 100;
const MAX_UBICACION = 255;

export const salaSchema = z.object({
  nombre: z.string('El nombre de la sala debe ser especificado').min(1, 'El nombre de la sala debe ser especificado').max(MAX_NOMBRE, `Máximo ${MAX_NOMBRE} caracteres`),
  tieneTerminal: z.boolean('Se debe especificar si la sala tiene terminal'),
  ubicacion: z.string('Se debe especificar la ubicación de la sala').min(1, 'Se debe especificar la ubicación de la sala').max(MAX_UBICACION, `Máximo ${MAX_UBICACION} caracteres`),
});

export type SalaType = z.infer<typeof salaSchema>;