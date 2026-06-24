// src/test/units/planSala.validator.test.ts
import { describe, it, expect } from 'vitest';
import { planSalaSchema } from '../../../planes/planSala/planSala.validator';

const payloadValido = {
    nombre: 'Plan Sala Test',
    normalizacionTiempo: 'mes' as const,
    tarifa: 45000,
    categoriaAnexable: 'sala' as const,
    esIntegrable: true,
    esNacional: true,
    cantUsuariosLinea: 16,
    cantUsuariosInvitados: 16,
    tieneVCReunionInteligente: false,
    tieneVCTodosPantalla: false,
    tieneVCRolesModerados: false,
    tieneVCClaseVirtual: false,
    tieneColabEdicionAgenda: false,
    tieneColabRealizarLlamadas: false,
    tieneColabCrearConferencias: false,
    tieneColabCompartirPantalla: false,
    tieneColabControlRemoto: false,
    tieneColabPresentacion: false,
    tieneColabEnviarArchivos: false,
    tieneColabRecibirArchivos: false,
    tieneColabGrabacion: false,
    tiempoAlmacenamiento: 0,
    almacenamientoLocal: false,
};

describe('planSalaSchema', () => {
    it('debe aceptar datos válidos', () => {
        expect(() => planSalaSchema.parse(payloadValido)).not.toThrow();
    });

    it('debe aceptar con extras vacío', () => {
        expect(() => planSalaSchema.parse({ ...payloadValido, extras: {} })).not.toThrow();
    });

    it('debe aceptar con salas_ids', () => {
        expect(() => planSalaSchema.parse({ ...payloadValido, extras: { salas_ids: [1, 2] } })).not.toThrow();
    });

    // Mínimos
    it('debe rechazar cantUsuariosLinea menor a 1', () => {
        expect(() => planSalaSchema.parse({ ...payloadValido, cantUsuariosLinea: 0 })).toThrow();
    });

    it('debe rechazar cantUsuariosInvitados menor a 1', () => {
        expect(() => planSalaSchema.parse({ ...payloadValido, cantUsuariosInvitados: 0 })).toThrow();
    });

    it('debe rechazar tiempoAlmacenamiento negativo', () => {
        expect(() => planSalaSchema.parse({ ...payloadValido, tiempoAlmacenamiento: -1 })).toThrow();
    });

    // Máximos
    it('debe aceptar cantUsuariosLinea en el límite máximo', () => {
        expect(() => planSalaSchema.parse({ ...payloadValido, cantUsuariosLinea: 10000 })).not.toThrow();
    });

    it('debe rechazar cantUsuariosLinea mayor a 10000', () => {
        expect(() => planSalaSchema.parse({ ...payloadValido, cantUsuariosLinea: 10001 })).toThrow();
    });

    it('debe aceptar cantUsuariosInvitados en el límite máximo', () => {
        expect(() => planSalaSchema.parse({ ...payloadValido, cantUsuariosInvitados: 10000 })).not.toThrow();
    });

    it('debe rechazar cantUsuariosInvitados mayor a 10000', () => {
        expect(() => planSalaSchema.parse({ ...payloadValido, cantUsuariosInvitados: 10001 })).toThrow();
    });

    it('debe aceptar tiempoAlmacenamiento en el límite máximo', () => {
        expect(() => planSalaSchema.parse({ ...payloadValido, tiempoAlmacenamiento: 8760 })).not.toThrow();
    });

    it('debe rechazar tiempoAlmacenamiento mayor a 8760', () => {
        expect(() => planSalaSchema.parse({ ...payloadValido, tiempoAlmacenamiento: 8761 })).toThrow();
    });
});