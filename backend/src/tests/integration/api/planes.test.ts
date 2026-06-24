// src/tests/integration/planes.test.ts
process.env.NODE_ENV = 'test';

import './../setup'
import request from 'supertest';
import app from '../../../app';

const PLAN_VALIDO = {
    tipo: 'sala',
    nombre: 'Plan Test',
    normalizacionTiempo: 'mes',
    tarifa: 45000,
    categoriaAnexable: 'sala',
    esIntegrable: true,
    esNacional: true,
    cantUsuariosLinea: 16,
    cantUsuariosInvitados: 16,
    tiempoAlmacenamiento: 0,
    almacenamientoLocal: false,
};

// Helper para crear un plan y devolver su respuesta
const crearPlan = (data = PLAN_VALIDO) => request(app).post('/plan').send(data);

// ─── POST /plan ───────────────────────────────────────
describe('POST /plan', () => {
    it('debe crear un plan correctamente', async () => {
        const res = await crearPlan();
        expect(res.status).toBe(201);
        expect(res.body.PlanBaseModel.nombre).toBe('Plan Test');
        expect(res.body.PlanBaseModel.tarifa).toBe(45000);
        expect(res.body.PlanBaseModel.tasa_fk).toBeDefined();
    });

    // Validaciones de schema
    it('debe rechazar sin campo tipo', async () => {
        const { tipo, ...sinTipo } = PLAN_VALIDO;
        const res = await request(app).post('/plan').send(sinTipo);
        expect(res.status).toBe(400);
    });

    it('debe rechazar con tipo vacío', async () => {
        const res = await crearPlan({ ...PLAN_VALIDO, tipo: '' });
        expect(res.status).toBe(400);
    });

    it('debe rechazar nombre muy corto', async () => {
        const res = await crearPlan({ ...PLAN_VALIDO, nombre: 'ab' });
        expect(res.status).toBe(400);
    });

    it('debe rechazar tarifa negativa', async () => {
        const res = await crearPlan({ ...PLAN_VALIDO, tarifa: -1 });
        expect(res.status).toBe(400);
    });

    it('debe rechazar tarifa cero', async () => {
        const res = await crearPlan({ ...PLAN_VALIDO, tarifa: 0 });
        expect(res.status).toBe(400);
    });

    it('debe rechazar normalizacionTiempo inválido', async () => {
        const res = await crearPlan({ ...PLAN_VALIDO, normalizacionTiempo: 'año' });
        expect(res.status).toBe(400);
    });

    it('debe rechazar categoriaAnexable inválida', async () => {
        const res = await crearPlan({ ...PLAN_VALIDO, categoriaAnexable: 'invalid' });
        expect(res.status).toBe(400);
    });

    // Regla de negocio: nombre duplicado
    it('debe rechazar nombre duplicado', async () => {
        await crearPlan();
        const res = await crearPlan();
        expect(res.status).toBe(409);
        expect(res.body.error).toMatch(/ya existe/);
    });

    // Validaciones específicas de plan sala
    it('debe rechazar cantUsuariosLinea menor a 1', async () => {
        const res = await crearPlan({ ...PLAN_VALIDO, cantUsuariosLinea: 0 });
        expect(res.status).toBe(400);
    });

    it('debe rechazar cantUsuariosInvitados menor a 1', async () => {
        const res = await crearPlan({ ...PLAN_VALIDO, cantUsuariosInvitados: 0 });
        expect(res.status).toBe(400);
    });

    it('debe rechazar tiempoAlmacenamiento negativo', async () => {
        const res = await crearPlan({ ...PLAN_VALIDO, tiempoAlmacenamiento: -1 });
        expect(res.status).toBe(400);
    });
});

// ─── GET /plan?tipo=sala ──────────────────────────────
describe('GET /plan?tipo=sala', () => {
    it('debe devolver lista vacía sin planes', async () => {
        const res = await request(app).get('/plan?tipo=sala');
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('debe devolver 400 sin parámetro tipo', async () => {
        const res = await request(app).get('/plan');
        expect(res.status).toBe(400);
    });

    it('debe devolver 400 con tipo vacío', async () => {
        const res = await request(app).get('/plan?tipo=');
        expect(res.status).toBe(400);
    });

    it('debe devolver planes ordenados por tarifa', async () => {
        await crearPlan({ ...PLAN_VALIDO, nombre: 'Plan Caro', tarifa: 50000 });
        await crearPlan({ ...PLAN_VALIDO, nombre: 'Plan Barato', tarifa: 10000 });

        const res = await request(app).get('/plan?tipo=sala');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0].PlanBaseModel.tarifa).toBe(10000);
        expect(res.body[1].PlanBaseModel.tarifa).toBe(50000);
    });
});

// ─── GET /plan/:tipo/:id ──────────────────────────────
describe('GET /plan/:tipo/:id', () => {
    it('debe obtener un plan por id', async () => {
        const created = await crearPlan();
        const res = await request(app).get(`/plan/sala/${created.body.id}`);
        expect(res.status).toBe(200);
        expect(res.body.PlanBaseModel.nombre).toBe('Plan Test');
    });

    it('debe devolver 404 sin id', async () => {
        const res = await request(app).get('/plan/sala/');
        expect(res.status).toBe(404);
    });

    it('debe devolver 500 con id inexistente', async () => {
        const res = await request(app).get('/plan/sala/99999');
        expect(res.status).toBe(500);
        expect(res.body.error).toMatch(/no encontrado/);
    });

    it('debe devolver 404 sin tipo en params', async () => {
        const res = await request(app).get('/plan//1');
        expect(res.status).toBe(404);
    });
});

// ─── PUT /plan/:tipo/:id ──────────────────────────────
describe('PUT /plan/:tipo/:id', () => {
    it('debe modificar un plan correctamente', async () => {
        const created = await crearPlan();
        const res = await request(app)
            .put(`/plan/sala/${created.body.id}`)
            .send({ tarifa: 99999 });
        expect(res.status).toBe(200);
        expect(res.body.PlanBaseModel.tarifa).toBe(99999);
        expect(res.body.PlanBaseModel.nombre).toBe('Plan Test');
    });

    it('debe devolver 404 sin id', async () => {
        const res = await request(app).put('/plan/sala/').send({ tarifa: 100 });
        expect(res.status).toBe(404);
    });

    it('debe devolver 400 con datos inválidos', async () => {
        const created = await crearPlan();
        const res = await request(app)
            .put(`/plan/sala/${created.body.id}`)
            .send({ cantUsuariosLinea: -1 });
        expect(res.status).toBe(400);
    });

    it('debe devolver 500 con id inexistente', async () => {
        const res = await request(app)
            .put('/plan/sala/99999')
            .send({ tarifa: 100 });
        expect(res.status).toBe(500);
        expect(res.body.error).toMatch(/no encontrado/);
    });
});

// ─── DELETE /plan/:tipo/:id ───────────────────────────
describe('DELETE /plan/:tipo/:id', () => {
    it('debe eliminar un plan correctamente', async () => {
        const created = await crearPlan();
        const res = await request(app).delete(`/plan/sala/${created.body.id}`);
        expect(res.status).toBe(200);

        const getRes = await request(app).get(`/plan/sala/${created.body.id}`);
        expect(getRes.status).toBe(500);
    });

    it('debe devolver 404 con id inexistente', async () => {
        const res = await request(app).delete('/plan/sala/99999');
        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/no encontrado/);
    });

    it('debe devolver 404 sin id', async () => {
        const res = await request(app).delete('/plan/sala/');
        expect(res.status).toBe(404);
    });
});