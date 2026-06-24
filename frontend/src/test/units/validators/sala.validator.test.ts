// src/test/units/sala.validator.test.ts
import { describe, it, expect } from 'vitest';
import { salaSchema } from '../../../planes/planSala/sala/sala.validator';

const payloadValido = {
    nombre: 'Sala Test',
    tieneTerminal: true,
    ubicacion: 'Piso 3',
};

describe('salaSchema', () => {
    it('debe aceptar datos válidos', () => {
        expect(() => salaSchema.parse(payloadValido)).not.toThrow();
    });

    it('debe aceptar tieneTerminal false', () => {
        expect(() => salaSchema.parse({ ...payloadValido, tieneTerminal: false })).not.toThrow();
    });

    it('debe rechazar nombre vacío', () => {
        expect(() => salaSchema.parse({ ...payloadValido, nombre: '' })).toThrow();
    });

    it('debe rechazar ubicacion vacía', () => {
        expect(() => salaSchema.parse({ ...payloadValido, ubicacion: '' })).toThrow();
    });

    // Máximos
    it('debe aceptar nombre en el límite máximo', () => {
        expect(() => salaSchema.parse({ ...payloadValido, nombre: 'a'.repeat(100) })).not.toThrow();
    });

    it('debe rechazar nombre mayor a 100', () => {
        expect(() => salaSchema.parse({ ...payloadValido, nombre: 'a'.repeat(101) })).toThrow();
    });

    it('debe aceptar ubicacion en el límite máximo', () => {
        expect(() => salaSchema.parse({ ...payloadValido, ubicacion: 'a'.repeat(255) })).not.toThrow();
    });

    it('debe rechazar ubicacion mayor a 255', () => {
        expect(() => salaSchema.parse({ ...payloadValido, ubicacion: 'a'.repeat(256) })).toThrow();
    });
});