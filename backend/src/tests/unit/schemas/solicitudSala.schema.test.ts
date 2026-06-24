import './../../helpers/mocks/models'
import { creationSolicitudSchema, validationSchema } from '../../../modulos/solicitudes/solicitudesSala/solicitudSala.schemas';
import { solicitudSalaSchema } from '../../../modulos/solicitudes/solicitudesSala/solicitudSala.validator';
import { solicitudBaseSchema } from '../../../modulos/solicitudes/solicitudBase.validator';
// Helpers
const fecha = (horasDesdeAhora: number) =>
    new Date(Date.now() + horasDesdeAhora * 60 * 60 * 1000).toISOString();

const payloadBase = {
    nombre: ['Plan Test'],
    fecha_inicio: [fecha(2)],
    fecha_fin: [fecha(4)],
    link_vc: 'test-link',
    contrato_generalId: 123,
    contrato_especificoId: 456,
    nombre_solicitante: 'Juan Perez',
    cargo: 'Director',
    entidad: 'MINED',
    correo: 'juan@mined.cu',
    numero: 51234567,
    planesSalaIds: [[1]],
    grabar: [false],
    info_contrato: {
        agente: { nombre: 'Ana', apellido: 'Lopez', unidad: 'Norte', cargo: 'Jefa', telefono: '51234567', correo: 'ana@etecsa.cu' },
        especialista: { nombre: 'Pedro', telefono: '51234568', correo: 'pedro@etecsa.cu' },
        ubicacion: { municipio: 'Centro', provincia: 'La Habana' },
    },
};

// ============================================================
// validationSchema
// ============================================================
describe('validationSchema', () => {
    it('acepta datos válidos', () => {
        const r = validationSchema.safeParse({ nombre: ['Test'], fecha_inicio: [fecha(2)], fecha_fin: [fecha(4)] });
        expect(r.success).toBe(true);
    });

    it('rechaza nombre < 3 caracteres', () => {
        const r = validationSchema.safeParse({ nombre: ['ab'], fecha_inicio: [fecha(2)], fecha_fin: [fecha(4)] });
        expect(r.success).toBe(false);
    });

    it('rechaza arrays de distinta longitud', () => {
        const r = validationSchema.safeParse({ nombre: ['A', 'B'], fecha_inicio: [fecha(2)], fecha_fin: [fecha(4)] });
        expect(r.success).toBe(false);
    });

    it('rechaza arrays vacíos', () => {
        const r = validationSchema.safeParse({ nombre: [], fecha_inicio: [], fecha_fin: [] });
        expect(r.success).toBe(false);
    });

    it('rechaza fecha_inicio como string no válido', () => {
        const r = validationSchema.safeParse({ nombre: ['Test'], fecha_inicio: ['no-es-fecha'], fecha_fin: [fecha(4)] });
        expect(r.success).toBe(false);
    });
});

// ============================================================
// creationSolicitudSchema
// ============================================================
describe('creationSolicitudSchema', () => {
    // --- válidos ---
    it('acepta payload completo', () => {
        expect(creationSolicitudSchema.safeParse(payloadBase).success).toBe(true);
    });

    it('acepta múltiples planes', () => {
        const r = creationSolicitudSchema.safeParse({
            ...payloadBase,
            nombre: ['Plan A', 'Plan B'],
            fecha_inicio: [fecha(2), fecha(3)],
            fecha_fin: [fecha(4), fecha(5)],
            planesSalaIds: [[1], [2, 3]],
            grabar: [false, true],
        });
        expect(r.success).toBe(true);
    });

    it('acepta facturación telefónica con número', () => {
        const r = creationSolicitudSchema.safeParse({
            ...payloadBase,
            info_contrato: { ...payloadBase.info_contrato, facturacion: { tipo: 'telefonica', numero: '51234567' } },
        });
        expect(r.success).toBe(true);
    });

    it('acepta facturación comercial sin número', () => {
        const r = creationSolicitudSchema.safeParse({
            ...payloadBase,
            info_contrato: { ...payloadBase.info_contrato, facturacion: { tipo: 'comercial' } },
        });
        expect(r.success).toBe(true);
    });

    // --- requeridos ---
    it('rechaza si falta link_vc', () => {
        const { link_vc, ...p } = payloadBase;
        expect(creationSolicitudSchema.safeParse(p).success).toBe(false);
    });

    it('rechaza si falta contrato_generalId', () => {
        const { contrato_generalId, ...p } = payloadBase;
        expect(creationSolicitudSchema.safeParse(p).success).toBe(false);
    });

    it('rechaza si falta contrato_especificoId', () => {
        const { contrato_especificoId, ...p } = payloadBase;
        expect(creationSolicitudSchema.safeParse(p).success).toBe(false);
    });

    it('rechaza si falta nombre_solicitante', () => {
        const { nombre_solicitante, ...p } = payloadBase;
        expect(creationSolicitudSchema.safeParse(p).success).toBe(false);
    });

    it('rechaza si falta cargo', () => {
        const { cargo, ...p } = payloadBase;
        expect(creationSolicitudSchema.safeParse(p).success).toBe(false);
    });

    it('rechaza si falta entidad', () => {
        const { entidad, ...p } = payloadBase;
        expect(creationSolicitudSchema.safeParse(p).success).toBe(false);
    });

    it('rechaza si falta correo', () => {
        const { correo, ...p } = payloadBase;
        expect(creationSolicitudSchema.safeParse(p).success).toBe(false);
    });

    it('rechaza si falta numero', () => {
        const { numero, ...p } = payloadBase;
        expect(creationSolicitudSchema.safeParse(p).success).toBe(false);
    });

    it('rechaza si falta planesSalaIds', () => {
        const { planesSalaIds, ...p } = payloadBase;
        expect(creationSolicitudSchema.safeParse(p).success).toBe(false);
    });

    it('rechaza si falta grabar', () => {
        const { grabar, ...p } = payloadBase;
        expect(creationSolicitudSchema.safeParse(p).success).toBe(false);
    });

    it('rechaza si falta info_contrato', () => {
        const { info_contrato, ...p } = payloadBase;
        expect(creationSolicitudSchema.safeParse(p).success).toBe(false);
    });

    // --- tipos inválidos ---
    it('rechaza correo inválido', () => {
        expect(creationSolicitudSchema.safeParse({ ...payloadBase, correo: 'no-es-correo' }).success).toBe(false);
    });

    it('rechaza número telefónico muy corto', () => {
        expect(creationSolicitudSchema.safeParse({ ...payloadBase, numero: 123 }).success).toBe(false);
    });

    it('rechaza número telefónico muy largo', () => {
        expect(creationSolicitudSchema.safeParse({ ...payloadBase, numero: 123456789 }).success).toBe(false);
    });

    it('rechaza link_vc muy corto', () => {
        expect(creationSolicitudSchema.safeParse({ ...payloadBase, link_vc: 'ab' }).success).toBe(false);
    });

    it('rechaza nombre_solicitante muy corto', () => {
        expect(creationSolicitudSchema.safeParse({ ...payloadBase, nombre_solicitante: 'Juan' }).success).toBe(false);
    });

    it('rechaza planesSalaIds con array vacío interno', () => {
        expect(creationSolicitudSchema.safeParse({ ...payloadBase, planesSalaIds: [[]] }).success).toBe(false);
    });

    it('rechaza planesSalaIds con número negativo', () => {
        expect(creationSolicitudSchema.safeParse({ ...payloadBase, planesSalaIds: [[-1]] }).success).toBe(false);
    });

    it('rechaza grabar con string en vez de boolean', () => {
        expect(creationSolicitudSchema.safeParse({ ...payloadBase, grabar: ['si'] }).success).toBe(false);
    });

    // --- info_contrato incompleto ---
    it('rechaza info_contrato sin agente.nombre', () => {
        const p = { ...payloadBase, info_contrato: { ...payloadBase.info_contrato, agente: { ...payloadBase.info_contrato.agente, nombre: '' } } };
        expect(creationSolicitudSchema.safeParse(p).success).toBe(false);
    });

    it('rechaza info_contrato sin agente.correo', () => {
        const p = { ...payloadBase, info_contrato: { ...payloadBase.info_contrato, agente: { ...payloadBase.info_contrato.agente, correo: 'no-email' } } };
        expect(creationSolicitudSchema.safeParse(p).success).toBe(false);
    });

    it('rechaza info_contrato sin especialista.nombre', () => {
        const p = { ...payloadBase, info_contrato: { ...payloadBase.info_contrato, especialista: { ...payloadBase.info_contrato.especialista, nombre: '' } } };
        expect(creationSolicitudSchema.safeParse(p).success).toBe(false);
    });

    it('rechaza info_contrato sin ubicacion.municipio', () => {
        const p = { ...payloadBase, info_contrato: { ...payloadBase.info_contrato, ubicacion: { ...payloadBase.info_contrato.ubicacion, municipio: '' } } };
        expect(creationSolicitudSchema.safeParse(p).success).toBe(false);
    });

    it('rechaza facturacion telefónica sin número', () => {
        const p = {
            ...payloadBase,
            info_contrato: { ...payloadBase.info_contrato, facturacion: { tipo: 'telefonica' } },
        };
        expect(creationSolicitudSchema.safeParse(p).success).toBe(false);
    });

    it('rechaza facturacion telefónica con número corto', () => {
        const p = {
            ...payloadBase,
            info_contrato: { ...payloadBase.info_contrato, facturacion: { tipo: 'telefonica', numero: '123' } },
        };
        expect(creationSolicitudSchema.safeParse(p).success).toBe(false);
    });

    it('rechaza facturacion con tipo inválido', () => {
        const p = {
            ...payloadBase,
            info_contrato: { ...payloadBase.info_contrato, facturacion: { tipo: 'otra' } },
        };
        expect(creationSolicitudSchema.safeParse(p).success).toBe(false);
    });
});

describe('solicitudSalaSchema', () => {
    it('acepta con id_planSala', () => {
        const r = solicitudSalaSchema.safeParse({
            id_planSala: 1,
            link_vc: 'test-link',
        });
        expect(r.success).toBe(true);
    });

    it('acepta con id_planCombinado', () => {
        const r = solicitudSalaSchema.safeParse({
            id_planCombinado: 1,
            link_vc: 'test-link',
        });
        expect(r.success).toBe(true);
    });

    it('rechaza ambos planSala y planCombinado a la vez', () => {
        const r = solicitudSalaSchema.safeParse({
            id_planSala: 1,
            id_planCombinado: 1,
            link_vc: 'test-link',
        });
        expect(r.success).toBe(false);
    });

    it('rechaza sin ninguno', () => {
        const r = solicitudSalaSchema.safeParse({
            link_vc: 'test-link',
        });
        expect(r.success).toBe(false);
    });

    it('acepta grabar por defecto false', () => {
        const r = solicitudSalaSchema.safeParse({
            id_planSala: 1,
            link_vc: 'test-link',
        });
        expect(r.data!.grabar).toBe(false);
    });

    it('acepta grabar true', () => {
        const r = solicitudSalaSchema.safeParse({
            id_planSala: 1,
            link_vc: 'test-link',
            grabar: true,
        });
        expect(r.data!.grabar).toBe(true);
    });

    it('rechaza link_vc menor a 3 caracteres', () => {
        const r = solicitudSalaSchema.safeParse({
            id_planSala: 1,
            link_vc: 'ab',
        });
        expect(r.success).toBe(false);
    });

    describe('creationSolicitudSchema - Valores máximos', () => {
        const payloadMinimo = {
            nombre: ['Plan Test'],
            fecha_inicio: [new Date()],
            fecha_fin: [new Date()],
            link_vc: 'https://meet.test.com/abc',
            contrato_generalId: 1,
            contrato_especificoId: 1,
            nombre_solicitante: 'Juan Pérez',
            cargo: 'Director',
            entidad: 'Empresa',
            correo: 'juan@test.com',
            numero: 12345678,
            planesSalaIds: [[1]],
            grabar: [false],
            info_contrato: {
                agente: { nombre: 'A', apellido: 'B', unidad: 'TI', cargo: 'C', telefono: '55555555', correo: 'a@test.com' },
                especialista: { nombre: 'E', telefono: '55555556', correo: 'e@test.com' },
                ubicacion: { municipio: 'LH', provincia: 'LH' }
            }
        };

        it('debe rechazar link_vc mayor a 500', () => {
            const payload = { ...payloadMinimo, link_vc: 'https://meet.test.com/' + 'a'.repeat(500) };
            expect(() => creationSolicitudSchema.parse(payload)).toThrow();
        });

        it('debe rechazar nombre_solicitante mayor a 255', () => {
            const payload = { ...payloadMinimo, nombre_solicitante: 'a'.repeat(256) };
            expect(() => creationSolicitudSchema.parse(payload)).toThrow();
        });
    });

    describe('solicitudSalaSchema - Valores máximos', () => {
        it('debe rechazar link_vc mayor a 500', () => {
            const payload = { id_planSala: 1, link_vc: 'a'.repeat(501), grabar: false };
            expect(() => solicitudSalaSchema.parse(payload)).toThrow();
        });
    });
});

// ─── validationSchema - Valores máximos ──────────────────
describe('validationSchema - Valores máximos', () => {
    it('debe rechazar nombre mayor a 255', () => {
        expect(() => validationSchema.parse({
            nombre: ['a'.repeat(256)],
            fecha_inicio: [new Date()],
            fecha_fin: [new Date()],
        })).toThrow();
    });
});

// ─── creationSolicitudSchema - Valores máximos ───────────
describe('creationSolicitudSchema - Valores máximos', () => {
    const payloadMinimo = {
        nombre: ['Plan Test'],
        fecha_inicio: [new Date()],
        fecha_fin: [new Date()],
        link_vc: 'https://meet.test.com/abc',
        contrato_generalId: 1,
        contrato_especificoId: 1,
        nombre_solicitante: 'Juan Pérez',
        cargo: 'Director',
        entidad: 'Empresa',
        correo: 'juan@test.com',
        numero: 12345678,
        planesSalaIds: [[1]],
        grabar: [false],
        info_contrato: {
            agente: { nombre: 'A', apellido: 'B', unidad: 'TI', cargo: 'C', telefono: '55555555', correo: 'a@test.com' },
            especialista: { nombre: 'E', telefono: '55555555', correo: 'e@test.com' },
            ubicacion: { municipio: 'LH', provincia: 'LH' }
        }
    };

    it('debe rechazar link_vc mayor a 500', () => {
        const payload = { ...payloadMinimo, link_vc: 'a'.repeat(501) };
        expect(() => creationSolicitudSchema.parse(payload)).toThrow();
    });

    it('debe aceptar link_vc de 500 caracteres', () => {
        const payload = { ...payloadMinimo, link_vc: 'https://' + 'a'.repeat(492) };
        expect(() => creationSolicitudSchema.parse(payload)).not.toThrow();
    });

    it('debe rechazar nombre_solicitante mayor a 255', () => {
        const payload = { ...payloadMinimo, nombre_solicitante: 'a'.repeat(256) };
        expect(() => creationSolicitudSchema.parse(payload)).toThrow();
    });

    it('debe rechazar entidad mayor a 255', () => {
        const payload = { ...payloadMinimo, entidad: 'a'.repeat(256) };
        expect(() => creationSolicitudSchema.parse(payload)).toThrow();
    });

    it('debe rechazar cargo mayor a 255', () => {
        const payload = { ...payloadMinimo, cargo: 'a'.repeat(256) };
        expect(() => creationSolicitudSchema.parse(payload)).toThrow();
    });

    it('debe rechazar correo mayor a 255', () => {
        const payload = { ...payloadMinimo, correo: 'a'.repeat(250) + '@test.com' };
        expect(() => creationSolicitudSchema.parse(payload)).toThrow();
    });


    it('debe rechazar agente con telefono distinto a 8 dígitos', () => {
        const payload = {
            ...payloadMinimo,
            info_contrato: {
                ...payloadMinimo.info_contrato,
                agente: { ...payloadMinimo.info_contrato.agente, telefono: '1234567' },
            },
        };
        expect(() => creationSolicitudSchema.parse(payload)).toThrow();
    });

    it('debe rechazar especialista con telefono mayor a 8 dígitos', () => {
        const payload = {
            ...payloadMinimo,
            info_contrato: {
                ...payloadMinimo.info_contrato,
                especialista: { ...payloadMinimo.info_contrato.especialista, telefono: '123456789' },
            },
        };
        expect(() => creationSolicitudSchema.parse(payload)).toThrow();
    });
});

// ─── solicitudSalaSchema - Valores máximos ───────────────
describe('solicitudSalaSchema - Valores máximos', () => {
    it('debe rechazar link_vc mayor a 500', () => {
        const payload = { id_planSala: 1, link_vc: 'a'.repeat(501), grabar: false };
        expect(() => solicitudSalaSchema.parse(payload)).toThrow();
    });

    it('debe aceptar link_vc de 500 caracteres', () => {
        const payload = { id_planSala: 1, link_vc: 'a'.repeat(500), grabar: false };
        expect(() => solicitudSalaSchema.parse(payload)).not.toThrow();
    });
});

// ─── solicitudBaseSchema - Valores máximos ───────────────
describe('solicitudBaseSchema - Valores máximos', () => {
    it('debe rechazar factura con más de 8 dígitos', () => {
        expect(() => solicitudBaseSchema.parse({
            fecha_inicio: new Date(),
            fecha_fin: new Date(),
            factura: '123456789',
        })).toThrow();
    });

    it('debe rechazar factura con menos de 8 dígitos', () => {
        expect(() => solicitudBaseSchema.parse({
            fecha_inicio: new Date(),
            fecha_fin: new Date(),
            factura: '1234567',
        })).toThrow();
    });

    it('debe aceptar factura de exactamente 8 dígitos', () => {
        expect(() => solicitudBaseSchema.parse({
            fecha_inicio: new Date(),
            fecha_fin: new Date(),
            factura: '12345678',
        })).not.toThrow();
    });
});