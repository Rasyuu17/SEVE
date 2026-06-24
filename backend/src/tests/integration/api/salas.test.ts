// src/tests/integration/salas.test.ts
process.env.NODE_ENV = 'test';

import './../setup'
import request from 'supertest';
import app from '../../../app';

const SALA_VALIDA = {
    nombre: 'Sala Test',
    ubicacion: 'Piso 3',
    tieneTerminal: true,
};

const crearSala = (data = SALA_VALIDA) => request(app).post('/sala').send(data);

// ─── POST /sala ──────────────────────────────────────
describe('POST /sala', () => {
    it('debe crear una sala correctamente', async () => {
        const res = await crearSala();
        expect(res.status).toBe(201);
        expect(res.body.nombre).toBe('Sala Test');
        expect(res.body.ubicacion).toBe('Piso 3');
        expect(res.body.tieneTerminal).toBe(true);
    });

    it('debe rechazar sin nombre', async () => {
        const { nombre, ...sinNombre } = SALA_VALIDA;
        const res = await request(app).post('/sala').send(sinNombre);
        expect(res.status).toBe(400);
    });

    it('debe crear sala sin terminal', async () => {
        const res = await crearSala({ nombre: 'Sala Simple', ubicacion: 'PB', tieneTerminal: false });
        expect(res.status).toBe(201);
        expect(res.body.tieneTerminal).toBe(false);
    });
});

// ─── GET /sala ───────────────────────────────────────
describe('GET /sala', () => {
    it('debe devolver lista vacía sin salas', async () => {
        const res = await request(app).get('/sala');
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('debe devolver todas las salas', async () => {
        await crearSala({ ...SALA_VALIDA, nombre: 'Sala A' });
        await crearSala({ ...SALA_VALIDA, nombre: 'Sala B' });

        const res = await request(app).get('/sala');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
    });
});

// ─── GET /sala/disponibles ───────────────────────────
describe('GET /sala/disponibles', () => {
    it('debe devolver salas disponibles sin planes', async () => {
        await crearSala({ ...SALA_VALIDA, nombre: 'Sala Libre' });
        await crearSala({ ...SALA_VALIDA, nombre: 'Sala Libre 2' });

        const res = await request(app).get('/sala/disponibles');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
    });

    it('debe excluir salas asociadas a planes activos', async () => {
        const sala = await crearSala({ ...SALA_VALIDA, nombre: 'Sala Ocupada' });
        const resSala = JSON.parse(JSON.stringify(sala.body));

        await request(app).post('/plan').send({
            tipo: 'sala',
            nombre: 'Plan Con Sala',
            normalizacionTiempo: 'mes',
            tarifa: 45000,
            categoriaAnexable: 'sala',
            esIntegrable: true,
            esNacional: true,
            cantUsuariosLinea: 16,
            cantUsuariosInvitados: 16,
            tiempoAlmacenamiento: 0,
            almacenamientoLocal: false,
            extras: { salas_ids: [resSala.id] },
        });

        const res = await request(app).get('/sala/disponibles');
        expect(res.status).toBe(200);
        expect(res.body.every((s: any) => s.id !== resSala.id)).toBe(true);
    });
});

// ─── GET /sala/:id ───────────────────────────────────
describe('GET /sala/:id', () => {
    it('debe obtener una sala por id', async () => {
        const created = await crearSala();
        const res = await request(app).get(`/sala/${created.body.id}`);
        expect(res.status).toBe(200);
        expect(res.body.nombre).toBe('Sala Test');
    });

    it('debe devolver 404 con id inexistente', async () => {
        const res = await request(app).get('/sala/99999');
        expect(res.status).toBe(404);
    });
});

// ─── GET /sala/:id/planes ──────────────────────────────
describe('GET /sala/:id/planes', () => {
    it('debe devolver las salas de un plan', async () => {
        const sala1 = await crearSala({ ...SALA_VALIDA, nombre: 'Sala A1' });
        const sala2 = await crearSala({ ...SALA_VALIDA, nombre: 'Sala A2' });

        const plan = await request(app).post('/plan').send({
            tipo: 'sala',
            nombre: 'Plan Con Salas',
            normalizacionTiempo: 'mes',
            tarifa: 50000,
            categoriaAnexable: 'sala',
            esIntegrable: true,
            esNacional: true,
            cantUsuariosLinea: 16,
            cantUsuariosInvitados: 16,
            tiempoAlmacenamiento: 0,
            almacenamientoLocal: false,
            extras: { salas_ids: [sala1.body.id, sala2.body.id] },
        });
        const id = plan.body.id
        const res = await request(app).get(`/sala/${id}/planes`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
    });

    it('debe devolver 404 con plan inexistente', async () => {
        const res = await request(app).get('/sala/99999/plan');
        expect(res.status).toBe(404);
    });
});

// ─── PUT /sala/:id ───────────────────────────────────
describe('PUT /sala/:id', () => {
    it('debe modificar una sala correctamente', async () => {
        const created = await crearSala();
        const res = await request(app)
            .put(`/sala/${created.body.id}`)
            .send({ nombre: 'Sala Modificada', ubicacion: 'Piso 1', tieneTerminal: false });
        expect(res.status).toBe(200);
        expect(res.body.nombre).toBe('Sala Modificada');
        expect(res.body.ubicacion).toBe('Piso 1');
    });

    it('debe devolver 404 con id inexistente', async () => {
        const res = await request(app)
            .put('/sala/99999')
            .send(SALA_VALIDA);
        expect(res.status).toBe(404);
    });

    it('debe rechazar modificar sala asociada a plan activo', async () => {
        const sala = await crearSala({ ...SALA_VALIDA, nombre: 'Sala Bloqueada' });

        await request(app).post('/plan').send({
            tipo: 'sala',
            nombre: 'Plan Bloqueante',
            normalizacionTiempo: 'mes',
            tarifa: 45000,
            categoriaAnexable: 'sala',
            esIntegrable: true,
            esNacional: true,
            cantUsuariosLinea: 16,
            cantUsuariosInvitados: 16,
            tiempoAlmacenamiento: 0,
            almacenamientoLocal: false,
            extras: { salas_ids: [sala.body.id] },
        });

        const res = await request(app)
            .put(`/sala/${sala.body.id}`)
            .send({ ...SALA_VALIDA, nombre: 'Intento Fallido' });
        expect(res.status).toBe(409);
        expect(res.body.error).toMatch(/asociada a un plan activo/);
    });
});

// ─── DELETE /sala/:id ────────────────────────────────
describe('DELETE /sala/:id', () => {
    it('debe eliminar una sala correctamente', async () => {
        const created = await crearSala();
        const res = await request(app).delete(`/sala/${created.body.id}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/eliminada/);

        const getRes = await request(app).get(`/sala/${created.body.id}`);
        expect(getRes.status).toBe(404);
    });

    it('debe devolver 404 con id inexistente', async () => {
        const res = await request(app).delete('/sala/99999');
        expect(res.status).toBe(404);
    });

    it('debe rechazar eliminar sala asociada a plan activo', async () => {
        const sala = await crearSala({ ...SALA_VALIDA, nombre: 'Sala Protegida' });

        await request(app).post('/plan').send({
            tipo: 'sala',
            nombre: 'Plan Protector',
            normalizacionTiempo: 'mes',
            tarifa: 45000,
            categoriaAnexable: 'sala',
            esIntegrable: true,
            esNacional: true,
            cantUsuariosLinea: 16,
            cantUsuariosInvitados: 16,
            tiempoAlmacenamiento: 0,
            almacenamientoLocal: false,
            extras: { salas_ids: [sala.body.id] },
        });

        const res = await request(app).delete(`/sala/${sala.body.id}`);
        expect(res.status).toBe(409);
        expect(res.body.error).toMatch(/asociada a un plan activo/);
    });
});