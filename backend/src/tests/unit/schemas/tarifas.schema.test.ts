import './../../helpers/mocks/models'
import { tarifasSchema } from '../../../modulos/tasaCambio/tasaCambio.schema';

describe('tarifasSchema', () => {
    // Válidos
    it('acepta solo cambios de tarifas sin nueva tasa', () => {
        const r = tarifasSchema.safeParse({
            cambios: [{ planId: 1, tipo: 'sala', nuevaTarifa: 45000 }],
        });
        expect(r.success).toBe(true);
    });

    it('acepta solo nueva tasa sin cambios de tarifas', () => {
        const r = tarifasSchema.safeParse({
            nuevaTasa: 32000,
            cambios: [],
        });
        expect(r.success).toBe(true);
    });

    it('acepta ambos: nueva tasa y cambios', () => {
        const r = tarifasSchema.safeParse({
            nuevaTasa: 32000,
            cambios: [
                { planId: 1, tipo: 'sala', nuevaTarifa: 45000 },
                { planId: 2, tipo: 'sala', nuevaTarifa: 55000 },
            ],
        });
        expect(r.success).toBe(true);
    });

    it('acepta cambios vacíos si hay nuevaTasa', () => {
        const r = tarifasSchema.safeParse({
            nuevaTasa: 32000,
            cambios: [],
        });
        expect(r.success).toBe(true);
    });

    // Inválidos - cambios
    it('rechaza sin nuevaTasa y sin cambios', () => {
        const r = tarifasSchema.safeParse({ cambios: [] });
        expect(r.success).toBe(false);
    });

    it('rechaza sin nuevaTasa y sin campo cambios', () => {
        const r = tarifasSchema.safeParse({});
        expect(r.success).toBe(false);
    });

    it('rechaza planId negativo', () => {
        const r = tarifasSchema.safeParse({
            nuevaTasa: 32000,
            cambios: [{ planId: -1, tipo: 'sala', nuevaTarifa: 45000 }],
        });
        expect(r.success).toBe(false);
    });

    it('rechaza planId cero', () => {
        const r = tarifasSchema.safeParse({
            cambios: [{ planId: 0, tipo: 'sala', nuevaTarifa: 45000 }],
        });
        expect(r.success).toBe(false);
    });

    it('rechaza planId no entero', () => {
        const r = tarifasSchema.safeParse({
            cambios: [{ planId: 1.5, tipo: 'sala', nuevaTarifa: 45000 }],
        });
        expect(r.success).toBe(false);
    });

    it('rechaza tipo inválido', () => {
        const r = tarifasSchema.safeParse({
            cambios: [{ planId: 1, tipo: 'otro', nuevaTarifa: 45000 }],
        });
        expect(r.success).toBe(false);
    });

    // Inválidos - nuevaTarifa
    it('rechaza nuevaTarifa negativa', () => {
        const r = tarifasSchema.safeParse({
            cambios: [{ planId: 1, tipo: 'sala', nuevaTarifa: -1 }],
        });
        expect(r.success).toBe(false);
    });

    it('rechaza nuevaTarifa cero', () => {
        const r = tarifasSchema.safeParse({
            cambios: [{ planId: 1, tipo: 'sala', nuevaTarifa: 0 }],
        });
        expect(r.success).toBe(false);
    });

    it('rechaza nuevaTarifa no entera', () => {
        const r = tarifasSchema.safeParse({
            cambios: [{ planId: 1, tipo: 'sala', nuevaTarifa: 3.14 }],
        });
        expect(r.success).toBe(false);
    });

    // Inválidos - nuevaTasa
    it('rechaza nuevaTasa negativa', () => {
        const r = tarifasSchema.safeParse({
            nuevaTasa: -1,
            cambios: [],
        });
        expect(r.success).toBe(false);
    });

    it('rechaza nuevaTasa cero', () => {
        const r = tarifasSchema.safeParse({
            nuevaTasa: 0,
            cambios: [],
        });
        expect(r.success).toBe(false);
    });

    it('rechaza nuevaTasa no entera', () => {
        const r = tarifasSchema.safeParse({
            nuevaTasa: 3.14,
            cambios: [],
        });
        expect(r.success).toBe(false);
    });

    it('rechaza nuevaTasa como string', () => {
        const r = tarifasSchema.safeParse({
            nuevaTasa: 'abc',
            cambios: [],
        });
        expect(r.success).toBe(false);
    });
});

describe('tarifasSchema - Valores máximos', () => {
    const MAX = 2147483647;

    it('debe aceptar nuevaTarifa en el límite máximo', () => {
        const payload = {
            cambios: [{ planId: 1, tipo: 'sala', nuevaTarifa: MAX }],
        };
        expect(() => tarifasSchema.parse(payload)).not.toThrow();
    });

    it('debe rechazar nuevaTarifa que excede el máximo', () => {
        const payload = {
            cambios: [{ planId: 1, tipo: 'sala', nuevaTarifa: MAX + 1 }],
        };
        expect(() => tarifasSchema.parse(payload)).toThrow();
    });

    it('debe aceptar nuevaTasa en el límite máximo', () => {
        const payload = { nuevaTasa: MAX, cambios: [] };
        expect(() => tarifasSchema.parse(payload)).not.toThrow();
    });

    it('debe rechazar nuevaTasa que excede el máximo', () => {
        const payload = { nuevaTasa: MAX + 1, cambios: [] };
        expect(() => tarifasSchema.parse(payload)).toThrow();
    });
});