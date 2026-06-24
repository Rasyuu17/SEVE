import './../../helpers/mocks/models'

import { planBaseSchema } from '../../../modulos/planes/planBase.validator';
import { planSalaSchema } from '../../../modulos/planes/planSala/planSala.validator';
import { planSalaUpdateSchema } from '../../../modulos/planes/planSala/planSala.validator';

describe('planBaseSchema', () => {
    const baseValido = {
        nombre: 'Plan Test',
        normalizacionTiempo: 'mes' as const,
        tarifa: 1000,
        categoriaAnexable: 'sala' as const,
    };

    it('acepta datos válidos', () => {
        expect(planBaseSchema.safeParse(baseValido).success).toBe(true);
    });

    it('rechaza nombre con menos de 3 caracteres', () => {
        expect(planBaseSchema.safeParse({ ...baseValido, nombre: 'ab' }).success).toBe(false);
    });

    it('rechaza nombre vacío', () => {
        expect(planBaseSchema.safeParse({ ...baseValido, nombre: '' }).success).toBe(false);
    });

    it('rechaza nombre con solo espacios', () => {
        expect(planBaseSchema.safeParse({ ...baseValido, nombre: '   ' }).success).toBe(false);
    });

    it('rechaza tarifa negativa', () => {
        expect(planBaseSchema.safeParse({ ...baseValido, tarifa: -1 }).success).toBe(false);
    });

    it('rechaza tarifa cero', () => {
        expect(planBaseSchema.safeParse({ ...baseValido, tarifa: 0 }).success).toBe(false);
    });

    it('rechaza normalizacionTiempo inválido', () => {
        expect(planBaseSchema.safeParse({ ...baseValido, normalizacionTiempo: 'año' }).success).toBe(false);
    });

    it('rechaza categoriaAnexable inválida', () => {
        expect(planBaseSchema.safeParse({ ...baseValido, categoriaAnexable: 'otra' }).success).toBe(false);
    });

    describe('planBaseSchema - Valores máximos', () => {
    const MAX_NOMBRE = 100;
    const MAX_TARIFA = 2147483647;

    it('debe aceptar nombre en el límite máximo', () => {
        const payload = { ...baseValido, nombre: 'a'.repeat(MAX_NOMBRE) };
        expect(() => planBaseSchema.parse(payload)).not.toThrow();
    });

    it('debe rechazar nombre que excede el máximo', () => {
        const payload = { ...baseValido, nombre: 'a'.repeat(MAX_NOMBRE + 1) };
        expect(() => planBaseSchema.parse(payload)).toThrow();
    });

    it('debe aceptar tarifa en el límite máximo', () => {
        const payload = { ...baseValido, tarifa: MAX_TARIFA };
        expect(() => planBaseSchema.parse(payload)).not.toThrow();
    });

    it('debe rechazar tarifa que excede el máximo', () => {
        const payload = { ...baseValido, tarifa: MAX_TARIFA + 1 };
        expect(() => planBaseSchema.parse(payload)).toThrow();
    });
});
});

describe('planSalaSchema', () => {
    const salaValido = {
        nombre: 'Sala Híbrida',
        normalizacionTiempo: 'mes' as const,
        tarifa: 45000,
        categoriaAnexable: 'sala' as const,
        esIntegrable: true,
        esNacional: true,
        cantUsuariosLinea: 16,
        cantUsuariosInvitados: 16,
        tieneVCReunionInteligente: true,
        tieneVCTodosPantalla: true,
        tieneVCRolesModerados: true,
        tieneVCClaseVirtual: true,
        tieneColabEdicionAgenda: true,
        tieneColabRealizarLlamadas: true,
        tieneColabCrearConferencias: true,
        tieneColabCompartirPantalla: true,
        tieneColabControlRemoto: true,
        tieneColabPresentacion: true,
        tieneColabEnviarArchivos: true,
        tieneColabRecibirArchivos: true,
        tieneColabGrabacion: true,
        tiempoAlmacenamiento: 0,
        almacenamientoLocal: false,
    };

    it('acepta datos válidos', () => {
        expect(planSalaSchema.safeParse(salaValido).success).toBe(true);
    });

    it('rechaza cantUsuariosLinea menor a 1', () => {
        expect(planSalaSchema.safeParse({ ...salaValido, cantUsuariosLinea: 0 }).success).toBe(false);
    });

    it('rechaza cantUsuariosInvitados menor a 1', () => {
        expect(planSalaSchema.safeParse({ ...salaValido, cantUsuariosInvitados: 0 }).success).toBe(false);
    });

    it('rechaza tiempoAlmacenamiento negativo', () => {
        expect(planSalaSchema.safeParse({ ...salaValido, tiempoAlmacenamiento: -1 }).success).toBe(false);
    });

    it('acepta con extras vacío', () => {
        expect(planSalaSchema.safeParse({ ...salaValido, extras: {} }).success).toBe(true);
    });

    it('acepta con salas_ids', () => {
        expect(planSalaSchema.safeParse({ ...salaValido, extras: { salas_ids: [1, 2] } }).success).toBe(true);
    });

    describe('planSalaSchema - Valores máximos', () => {
    const MAX_USUARIOS = 10000;

    it('debe aceptar cantUsuariosLinea en el límite máximo', () => {
        const payload = {
            ...salaValido,
            cantUsuariosLinea: MAX_USUARIOS,
        };
        expect(() => planSalaSchema.parse(payload)).not.toThrow();
    });

    it('debe rechazar cantUsuariosLinea que excede el máximo', () => {
        const payload = {
            ...salaValido,
            cantUsuariosLinea: MAX_USUARIOS + 1,
        };
        expect(() => planSalaSchema.parse(payload)).toThrow();
    });

    it('debe aceptar cantUsuariosInvitados en el límite máximo', () => {
        const payload = {
            ...salaValido,
            cantUsuariosInvitados: MAX_USUARIOS,
        };
        expect(() => planSalaSchema.parse(payload)).not.toThrow();
    });

    it('debe rechazar cantUsuariosInvitados que excede el máximo', () => {
        const payload = {
            ...salaValido,
            cantUsuariosInvitados: MAX_USUARIOS + 1,
        };
        expect(() => planSalaSchema.parse(payload)).toThrow();
    });

    it('debe aceptar tiempoAlmacenamiento en el límite máximo', () => {
        const payload = {
            ...salaValido,
            tiempoAlmacenamiento: 8760,
        };
        expect(() => planSalaSchema.parse(payload)).not.toThrow();
    });

    it('debe rechazar tiempoAlmacenamiento que excede el máximo', () => {
        const payload = {
            ...salaValido,
            tiempoAlmacenamiento: 8761,
        };
        expect(() => planSalaSchema.parse(payload)).toThrow();
    });
});
});

describe('planSalaUpdateSchema', () => {
    it('acepta objeto vacío', () => {
        expect(planSalaUpdateSchema.safeParse({}).success).toBe(true);
    });

    // nombre y tarifa NO se pueden actualizar con este schema
    it('ignora nombre (no es error porque es partial)', () => {
        const r = planSalaUpdateSchema.safeParse({ nombre: 'Nuevo' });
        expect(r.success).toBe(true);
    });

    it('ignora tarifa (no es error porque es partial)', () => {
        const r = planSalaUpdateSchema.safeParse({ tarifa: 50000 });
        expect(r.success).toBe(true);
    });

    it('acepta actualización de esIntegrable', () => {
        expect(planSalaUpdateSchema.safeParse({ esIntegrable: false }).success).toBe(true);
    });

    it('acepta actualización de esNacional', () => {
        expect(planSalaUpdateSchema.safeParse({ esNacional: true }).success).toBe(true);
    });

    it('acepta actualización de cantUsuariosLinea', () => {
        expect(planSalaUpdateSchema.safeParse({ cantUsuariosLinea: 20 }).success).toBe(true);
    });

    it('acepta actualización de cantUsuariosInvitados', () => {
        expect(planSalaUpdateSchema.safeParse({ cantUsuariosInvitados: 10 }).success).toBe(true);
    });

    it('acepta actualización de tiempoAlmacenamiento', () => {
        expect(planSalaUpdateSchema.safeParse({ tiempoAlmacenamiento: 7 }).success).toBe(true);
    });

    it('acepta actualización de almacenamientoLocal', () => {
        expect(planSalaUpdateSchema.safeParse({ almacenamientoLocal: true }).success).toBe(true);
    });

    it('acepta actualización de herramientas de colaboración', () => {
        expect(planSalaUpdateSchema.safeParse({
            tieneColabGrabacion: true,
            tieneColabCompartirPantalla: false,
        }).success).toBe(true);
    });

    it('acepta actualización de tipos de VC', () => {
        expect(planSalaUpdateSchema.safeParse({
            tieneVCReunionInteligente: true,
            tieneVCClaseVirtual: false,
        }).success).toBe(true);
    });

    it('acepta extras con salas_ids', () => {
        expect(planSalaUpdateSchema.safeParse({
            extras: { salas_ids: [1, 2] },
        }).success).toBe(true);
    });

    it('rechaza cantUsuariosLinea negativo', () => {
        expect(planSalaUpdateSchema.safeParse({ cantUsuariosLinea: -1 }).success).toBe(false);
    });

    it('rechaza cantUsuariosInvitados negativo', () => {
        expect(planSalaUpdateSchema.safeParse({ cantUsuariosInvitados: -5 }).success).toBe(false);
    });

    it('rechaza tiempoAlmacenamiento negativo', () => {
        expect(planSalaUpdateSchema.safeParse({ tiempoAlmacenamiento: -1 }).success).toBe(false);
    });
});