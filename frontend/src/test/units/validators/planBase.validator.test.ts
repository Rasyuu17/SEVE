// src/test/units/planBase.validator.test.ts
import { describe, it, expect } from 'vitest';
import { planBaseSchema } from './../../../planes/planBase.validator';

const payloadValido = {
    nombre: 'Plan Test',
    normalizacionTiempo: 'mes' as const,
    tarifa: 45000,
    categoriaAnexable: 'sala' as const,
};

describe('planBaseSchema', () => {
    // ─── Válidos ──────────────────────────────────────
    it('debe aceptar datos válidos', () => {
        expect(() => planBaseSchema.parse(payloadValido)).not.toThrow();
    });

    // ─── Mínimos ──────────────────────────────────────
    it('debe rechazar nombre con menos de 3 caracteres', () => {
        expect(() => planBaseSchema.parse({ ...payloadValido, nombre: 'ab' })).toThrow();
    });

    it('debe rechazar nombre vacío', () => {
        expect(() => planBaseSchema.parse({ ...payloadValido, nombre: '' })).toThrow();
    });

    it('debe rechazar tarifa negativa', () => {
        expect(() => planBaseSchema.parse({ ...payloadValido, tarifa: -1 })).toThrow();
    });

    it('debe rechazar tarifa cero', () => {
        expect(() => planBaseSchema.parse({ ...payloadValido, tarifa: 0 })).toThrow();
    });

    it('debe rechazar normalizacionTiempo inválido', () => {
        expect(() => planBaseSchema.parse({ ...payloadValido, normalizacionTiempo: 'año' })).toThrow();
    });

    it('debe rechazar categoriaAnexable inválida', () => {
        expect(() => planBaseSchema.parse({ ...payloadValido, categoriaAnexable: 'invalid' })).toThrow();
    });

    // ─── Máximos ──────────────────────────────────────
    it('debe aceptar nombre en el límite máximo', () => {
        expect(() => planBaseSchema.parse({ ...payloadValido, nombre: 'a'.repeat(100) })).not.toThrow();
    });

    it('debe rechazar nombre mayor a 100', () => {
        expect(() => planBaseSchema.parse({ ...payloadValido, nombre: 'a'.repeat(101) })).toThrow();
    });

    it('debe aceptar tarifa en el límite máximo', () => {
        expect(() => planBaseSchema.parse({ ...payloadValido, tarifa: 2147483647 })).not.toThrow();
    });

    it('debe rechazar tarifa mayor al máximo', () => {
        expect(() => planBaseSchema.parse({ ...payloadValido, tarifa: 2147483648 })).toThrow();
    });
});