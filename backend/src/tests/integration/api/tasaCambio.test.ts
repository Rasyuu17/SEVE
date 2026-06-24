// src/tests/integration/tasaCambio.test.ts
process.env.NODE_ENV = 'test';

import './../setup'
import request from 'supertest';
import app from '../../../app';

describe('GET /tasa/activas debe haber una tasa por defecto en la app', ()=>{
    it('debe devolver 100 centavos sin tasas', async () => {
        
        const res = await request(app).get('/tasa/activa');
        expect(res.status).toBe(200);
        expect(res.body.tasa).toBe(100);
    });

    it('debe devolver 500 si falla obtener tasa activa', async () => {
        // Importar el modelo para mockearlo
        const TasaCambioModel = (await import('../../../modulos/tasaCambio/tasaCambio.model')).default;
        const originalFindOne = TasaCambioModel.findOne;
        TasaCambioModel.findOne = jest.fn().mockRejectedValue(new Error('DB error')) as any;

        const res = await request(app).get('/tasa/activa');
        expect(res.status).toBe(500);

        TasaCambioModel.findOne = originalFindOne;
    });
})

describe('POST /tasa/tarifas solo tasa', () => {
    it('debe crear una tasa correctamente', async () => {
        const req = await request(app)
            .post('/tasa/tarifas')
            .send({ cambios: [], nuevaTasa: 32000 });

        const res = await request(app).get('/tasa/activa')
        expect(res.status).toBe(200);
        expect(res.body.tasa).toBe(32000);
    });

    it('debe rechazar tasa negativa', async () => {
        const res = await request(app)
            .post('/tasa/tarifas')
            .send({ cambios: [], nuevaTasa: -1 });

        expect(res.status).toBe(400);
    });

    it('debe rechazar tasa cero', async () => {
        const res = await request(app)
            .post('/tasa/tarifas')
            .send({ cambios: [], nuevaTasa: 0 });

        expect(res.status).toBe(400);
    },60000);

    it('debe rechazar sin campo tasa', async () => {
        const res = await request(app)
            .post('/tasa/tarifas')
            .send({cambios: []});

        expect(res.status).toBe(400);
    });

});

describe('GET /tasa/activa', () => {
    it('debe devolver la tasa activa', async () => {
        const req = await request(app)
            .post('/tasa/tarifas')
            .send({ cambios: [], nuevaTasa: 32000 });

        const res = await request(app).get('/tasa/activa');
        expect(res.status).toBe(200);
        expect(res.body.tasa).toBe(32000);
    });

    it('debe devolver la tasa más reciente si hay varias', async () => {
        await request(app)
            .post('/tasa/tarifas')
            .send({ cambios: [], nuevaTasa: 10000 });
        await request(app)
            .post('/tasa/tarifas')
            .send({ cambios: [], nuevaTasa: 20000 });

        const res = await request(app).get('/tasa/activa');
        expect(res.status).toBe(200);
        expect(res.body.tasa).toBe(20000);
    });
});

describe('POST /tasa/tarifas con cambios de planes', () => {
    it('debe devolver 400 si falla aplicarCambiosTarifas', async () => {
        const res = await request(app)
            .post('/tasa/tarifas')
            .send({
                cambios: [{ planId: 99999, tipo: 'sala', nuevaTarifa: 50000 }],
                nuevaTasa: 200,
            });
        expect(res.status).toBe(400);
    });
});

