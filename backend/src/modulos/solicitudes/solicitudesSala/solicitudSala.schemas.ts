// solicitudSala.schemas.ts
import z from 'zod'

const MAX_STRING = 255;
const MAX_LINK = 500;

export const validationSchema = z.object({
    nombre: z.array(z.string().min(3).max(MAX_STRING)).min(1, 'Al menos un nombre requerido'),
    fecha_inicio: z.array(z.coerce.date()).min(1),
    fecha_fin: z.array(z.coerce.date()).min(1),
});

export type validationType = z.infer<typeof validationSchema>

const facturaSchema = z.discriminatedUnion('tipo', [
    z.object({ tipo: z.literal('comercial') }),
    z.object({ 
        tipo: z.literal('telefonica'), 
        numero: z.string().length(8, 'Debe tener 8 dígitos')
    }),
]);
    
export type facturaType = z.infer<typeof facturaSchema>

const contractInfoSchema = z.object({
    agente: z.object({
        nombre: z.string().min(1, 'Nombre requerido').max(MAX_STRING),
        apellido: z.string().min(1, 'Apellido requerido').max(MAX_STRING),
        unidad: z.string().min(1, 'Unidad requerida').max(MAX_STRING),
        cargo: z.string().min(1, 'Cargo requerido').max(MAX_STRING),
        telefono: z.string().length(8, 'Debe tener 8 dígitos'),
        correo: z.email('Correo inválido').max(MAX_STRING),
    }),
    especialista: z.object({
        nombre: z.string().min(1, 'Nombre requerido').max(MAX_STRING),
        telefono: z.string().length(8, 'Debe tener 8 dígitos'),
        correo: z.email('Correo inválido').max(MAX_STRING),
    }),
    ubicacion: z.object({
        municipio: z.string().min(1, 'Municipio requerido').max(MAX_STRING),
        provincia: z.string().min(1, 'Provincia requerida').max(MAX_STRING),
    }),
    facturacion: facturaSchema.optional()
})

export type contractInfoType = z.infer<typeof contractInfoSchema>

export const creationSolicitudSchema = validationSchema.extend({
    link_vc: z.string('El link de videoconferencia es necesario').min(3).max(MAX_LINK),
    contrato_generalId: z.number('Es necesario el número de contrato general').int().positive('Debe ser un número positivo').max(2147483647),
    contrato_especificoId: z.number('Es necesario el número de contrato específico').int().positive('Debe ser un número positivo').max(2147483647),
    nombre_solicitante: z.string('Es necesario el nombre del solicitante').min(5).max(MAX_STRING),
    cargo: z.string('Es necesario el cargo del solicitante').min(5).max(MAX_STRING),
    entidad: z.string('Es necesario el nombre de la entidad').min(3).max(MAX_STRING),
    correo: z.email().max(MAX_STRING),
    numero: z.number().int().min(10000000).max(99999999),
    planesSalaIds: z.array(z.array(z.number().int().positive().max(2147483647)).min(1)).min(1),
    grabar: z.array(z.boolean()).min(1),
    info_contrato: contractInfoSchema
})

export type creationSolicitudType = z.infer<typeof creationSolicitudSchema>