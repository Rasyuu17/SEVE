// src/tests/integration/pdfDocs.test.ts
process.env.NODE_ENV = 'test';

import '../setup'

import { container } from '../../../helpers/services.container';
container.register('RepoService', {
    subirPDF: jest.fn().mockResolvedValue({ success: true, url: 'https://repo.test/doc.pdf' }),
    obtenerPDF: jest.fn().mockResolvedValue(Buffer.from('fake-pdf')),
});

import request from 'supertest';
import app from '../../../app';

// Importar controllers necesarios
import '../../../modulos/solicitudes/solicitudesSala/solicitudSala.controller'
import '../../../modulos/solicitudes/pdfDocs/pdfDocs.controller'
import { PdfController } from '../../../modulos/solicitudes/pdfDocs/pdfDocs.controller';
container.get<PdfController>('PdfController');
import { SolicitudSalaController } from '../../../modulos/solicitudes/solicitudesSala/solicitudSala.controller';
container.get<SolicitudSalaController>('SolicitudSalaController');

const fechaFutura = (horas: number = 48) => new Date(Date.now() + horas * 3600000).toISOString();

const PLAN_BASE = {
    tipo: 'sala', normalizacionTiempo: 'mes', tarifa: 45000,
    categoriaAnexable: 'sala', esIntegrable: true, esNacional: true,
    cantUsuariosLinea: 16, cantUsuariosInvitados: 16,
    tiempoAlmacenamiento: 0, almacenamientoLocal: false,
};

const crearPlan = (nombre: string) =>
    request(app).post('/plan').send({ ...PLAN_BASE, nombre });

const crearSolicitud = async (nombrePlan: string) => {
    const plan = await crearPlan(nombrePlan);
    const planId = plan.body.PlanBaseModel.id;
    const res = await request(app)
        .post('/solicitud/sala')
        .send({
            nombre: [nombrePlan],
            fecha_inicio: [fechaFutura(48)],
            fecha_fin: [fechaFutura(50)],
            numero: 12345678,
            link_vc: 'https://meet.test.com/' + Math.random().toString(36).slice(2, 7),
            nombre_solicitante: 'Juan Test',
            cargo: 'Director General',
            entidad: 'Empresa Test',
            contrato_generalId: 1,
            contrato_especificoId: 1,
            correo: 'juan@test.com',
            planesSalaIds: [[planId]],
            grabar: [false],
            info_contrato: {
                agente: {
                    nombre: 'Agente', apellido: 'Prueba', unidad: 'TI',
                    cargo: 'Especialista', telefono: '55555555', correo: 'agente@test.com'
                },
                especialista: {
                    nombre: 'Especialista', telefono: '55555556', correo: 'esp@test.com'
                },
                ubicacion: {
                    municipio: 'La Habana', provincia: 'La Habana'
                }
            },
        });
    return res.body;
};

// ─── GET /documentos ─────────────────────────────────
describe('GET /documentos', () => {
    it('debe devolver lista de documentos', async () => {
        await crearSolicitud('Plan Docs List');

        const res = await request(app).get('/documentos');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(1);
        expect(res.body.pagination).toBeDefined();
    });

    it('debe devolver lista vacía sin documentos', async () => {
        const res = await request(app).get('/documentos');
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
    });

    it('debe filtrar por entidad', async () => {
        await crearSolicitud('Plan Filter Entidad');

        const res = await request(app).get('/documentos?entidad=Empresa Test');
        expect(res.status).toBe(200);
        expect(res.body.data.every((d: any) => d.entidad === 'Empresa Test')).toBe(true);
    });

    it('debe filtrar por numero de contrato', async () => {
        await crearSolicitud('Plan Filter Num');

        const res = await request(app).get('/documentos?numero=12345678');
        expect(res.status).toBe(200);
        expect(res.body.data.every((d: any) => d.numero === 12345678)).toBe(true);
    });

    it('debe manejar filtro sin resultados', async () => {
        const res = await request(app).get('/documentos?entidad=NoExiste');
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
    });

    it('debe respetar paginación', async () => {
        const res = await request(app).get('/documentos?page=1&limit=5');
        expect(res.status).toBe(200);
        expect(res.body.pagination.page).toBe(1);
        expect(res.body.pagination.limit).toBe(5);
    });
});

// ─── GET /documentos/:id/descargar ───────────────────
describe('GET /documentos/:id/descargar', () => {
    it('debe descargar un PDF', async () => {
        const creada = await crearSolicitud('Plan Descarga');
        const docId = creada.data.documentoId;

        const res = await request(app).get(`/documentos/${docId}/descargar`);
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toBe('application/pdf');
        expect(Buffer.isBuffer(res.body)).toBe(true);
    });

    it('debe devolver 404 con documento inexistente', async () => {
        const res = await request(app).get('/documentos/99999/descargar');
        expect(res.status).toBe(404);
    });
});

// ─── POST /documentos/:id/firmar ─────────────────────
describe('POST /documentos/:id/firmar', () => {
    it('debe rechazar sin archivo', async () => {
        const creada = await crearSolicitud('Plan Firmar');
        const docId = creada.data.documentoId;

        const res = await request(app)
            .post(`/documentos/${docId}/firmar`);
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/no se envió ningún archivo/i);
    });

    it('debe devolver 400 con documento inexistente', async () => {
        const res = await request(app)
            .post('/documentos/99999/firmar')
            .attach('file', Buffer.from('fake-pdf'), 'test.pdf');
        expect(res.status).toBe(400);
    });
});

// ─── PUT /documentos/:documentoId/sala/confirmar ─────
describe('PUT /documentos/:documentoId/sala/confirmar', () => {
    it('debe rechazar documento sin estado necesita confirmacion', async () => {
        const creada = await crearSolicitud('Plan Confirmar');
        const docId = creada.data.documentoId;

        const res = await request(app).put(`/documentos/${docId}/sala/confirmar`);
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/no requiere confirmación/i);
    });

    it('debe devolver 400 con documento inexistente', async () => {
        const res = await request(app).put('/documentos/99999/sala/confirmar');
        expect(res.status).toBe(400);
    });
});