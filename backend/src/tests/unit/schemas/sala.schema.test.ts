import './../../helpers/mocks/models'
import { salaSchema } from '../../../modulos/planes/planSala/sala/sala.validator';

describe('salaSchema', () => {
    const salaValida = {
        nombre: 'Sala 1',
        tieneTerminal: true,
        ubicacion: 'Piso 1',
    };

    it('acepta datos válidos', () => {
        expect(salaSchema.safeParse(salaValida).success).toBe(true);
    });

    it('rechaza nombre vacío', () => {
        expect(salaSchema.safeParse({ ...salaValida, nombre: '' }).success).toBe(false);
    });

    it('rechaza ubicacion vacía', () => {
        expect(salaSchema.safeParse({ ...salaValida, ubicacion: '' }).success).toBe(false);
    });

    it('acepta tieneTerminal false', () => {
        expect(salaSchema.safeParse({ ...salaValida, tieneTerminal: false }).success).toBe(true);
    });

    describe('salaSchema - Valores máximos', () => {
        it('debe aceptar nombre en el límite máximo', () => {
            const payload = { nombre: 'a'.repeat(100), tieneTerminal: true, ubicacion: 'PB' };
            expect(() => salaSchema.parse(payload)).not.toThrow();
        });

        it('debe rechazar nombre que excede el máximo', () => {
            const payload = { nombre: 'a'.repeat(101), tieneTerminal: true, ubicacion: 'PB' };
            expect(() => salaSchema.parse(payload)).toThrow();
        });

        it('debe aceptar ubicacion en el límite máximo', () => {
            const payload = { nombre: 'Sala', tieneTerminal: true, ubicacion: 'a'.repeat(255) };
            expect(() => salaSchema.parse(payload)).not.toThrow();
        });

        it('debe rechazar ubicacion que excede el máximo', () => {
            const payload = { nombre: 'Sala', tieneTerminal: true, ubicacion: 'a'.repeat(256) };
            expect(() => salaSchema.parse(payload)).toThrow();
        });
    });
});