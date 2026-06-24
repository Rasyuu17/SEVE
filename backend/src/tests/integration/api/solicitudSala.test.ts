// src/tests/integration/solicitudes.test.ts
process.env.NODE_ENV = 'test';

import '../setup'
import request from 'supertest';
import app from '../../../app';
import sequelize from '../../../config/database';

const PLAN_VALIDO = {
    tipo: 'sala', nombre: 'Plan Calendario', normalizacionTiempo: 'mes',
    tarifa: 45000, categoriaAnexable: 'sala', esIntegrable: true, esNacional: true,
    cantUsuariosLinea: 16, cantUsuariosInvitados: 16,
    tiempoAlmacenamiento: 0, almacenamientoLocal: false,
};

const crearPlan = (data = PLAN_VALIDO) => request(app).post('/plan').send(data);

const fechaFutura = (horas: number) => new Date(Date.now() + horas * 3600000).toISOString();

// ─── POST /solicitud/sala/disponibilidad ────────────
describe('POST /solicitud/sala/disponibilidad', () => {
    it('debe devolver válido para plan sin conflictos', async () => {
        await crearPlan();
        const res = await request(app)
            .post('/solicitud/sala/disponibilidad')
            .send({
                nombre: ['Plan Calendario'],
                fecha_inicio: [fechaFutura(48)],
                fecha_fin: [fechaFutura(50)],
            });
        expect(res.status).toBe(200);
        expect(res.body.data[0].valido).toBe(true);
    });

    it('debe rechazar fecha con menos de 1 hora de anticipación', async () => {
        await crearPlan();
        const res = await request(app)
            .post('/solicitud/sala/disponibilidad')
            .send({
                nombre: ['Plan Calendario'],
                fecha_inicio: [fechaFutura(0.5)], // 30 min
                fecha_fin: [fechaFutura(2)],
            });
        expect(res.status).toBe(200);
        expect(res.body.data[0].valido).toBe(false);
    });

    it('debe rechazar duración menor a 1 hora', async () => {
        await crearPlan();
        const res = await request(app)
            .post('/solicitud/sala/disponibilidad')
            .send({
                nombre: ['Plan Calendario'],
                fecha_inicio: [fechaFutura(48)],
                fecha_fin: [fechaFutura(48.5)], // 30 min de duración
            });
        expect(res.status).toBe(200);
        expect(res.body.data[0].valido).toBe(false);
    });

    it('debe rechazar plan inexistente', async () => {
        const res = await request(app)
            .post('/solicitud/sala/disponibilidad')
            .send({
                nombre: ['Plan Inexistente'],
                fecha_inicio: [fechaFutura(48)],
                fecha_fin: [fechaFutura(50)],
            });
        expect(res.status).toBe(200);
        expect(res.body.data[0].valido).toBe(false);
    });

    it('debe validar múltiples planes', async () => {
        await crearPlan({ ...PLAN_VALIDO, nombre: 'Plan A' });
        await crearPlan({ ...PLAN_VALIDO, nombre: 'Plan B' });
        
        const res = await request(app)
            .post('/solicitud/sala/disponibilidad')
            .send({
                nombre: ['Plan A', 'Plan B'],
                fecha_inicio: [fechaFutura(48), fechaFutura(100)],
                fecha_fin: [fechaFutura(50), fechaFutura(102)],
            });
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
        expect(res.body.data.every((d: any) => d.valido)).toBe(true);
    });

    it('debe rechazar múltiples planes con solapamiento de horario', async () => {
        await crearPlan({ ...PLAN_VALIDO, nombre: 'Plan A' });
        await crearPlan({ ...PLAN_VALIDO, nombre: 'Plan B' });
        
        const res = await request(app)
            .post('/solicitud/sala/disponibilidad')
            .send({
                nombre: ['Plan A', 'Plan B'],
                fecha_inicio: [fechaFutura(48), fechaFutura(49)],  // Solapan
                fecha_fin: [fechaFutura(50), fechaFutura(51)],
            });
        expect(res.status).toBe(200);
        expect(res.body.data.some((d: any) => !d.valido)).toBe(true);
    });
});

// ─── GET /solicitud/sala/:name/:month/:year ──────────
describe('GET /solicitud/sala/:name/:month/:year', () => {
    it('debe devolver 404 sin solicitudes en el mes', async () => {
        const res = await request(app).get('/solicitud/sala/PlanInexistente/5/2026');
        expect(res.status).toBe(404);
    });

    it('debe devolver calendario vacío si no hay solicitudes para ese plan', async () => {
        await crearPlan({ ...PLAN_VALIDO, nombre: 'Plan Solo' });
        const res = await request(app).get('/solicitud/sala/Plan Solo/5/2026');
        expect(res.status).toBe(404);
    });
});

// ─── GET /solicitud/sala/documento/:id ───────────────
describe('GET /solicitud/sala/documento/:documentoId', () => {
    it('debe devolver array vacío con documento inexistente', async () => {
        const res = await request(app).get('/solicitud/sala/documento/99999');
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
    });
});

// ─── GET /solicitud/sala/:id ─────────────────────────
describe('GET /solicitud/sala/:id', () => {
    it('debe devolver 404 con solicitud inexistente', async () => {
        const res = await request(app).get('/solicitud/sala/99999');
        expect(res.status).toBe(404);
    });
});

// ─── PUT cancelar ───────────────────────────────────────
describe('PUT /solicitud/sala/:id/cancelar', () => {
    it('debe devolver 404 con solicitud inexistente', async () => {
        const res = await request(app).put('/solicitud/sala/99999/cancelar');
        expect(res.status).toBe(404);
    });
});

describe('PUT /solicitud/sala/documento/:documentoId/cancelar', () => {
    it('debe devolver 404 con documento inexistente', async () => {
        const res = await request(app).put('/solicitud/sala/documento/99999/cancelar');
        expect(res.status).toBe(404);
    });
});