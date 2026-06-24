// src/tests/integration/solicitudesSala-flujos.test.ts
process.env.NODE_ENV = 'test';

import './../setup'

import { container } from '../../../helpers/services.container';
container.register('RepoService', {
    subirPDF: jest.fn().mockResolvedValue({ 
        success: true, 
        url: 'https://repo.test/documento.pdf' 
    }),
});

import request from 'supertest';
import app from '../../../app';
import '../../../modulos/solicitudes/solicitudesSala/solicitudSala.controller'
import { SolicitudSalaController } from '../../../modulos/solicitudes/solicitudesSala/solicitudSala.controller';
container.get<SolicitudSalaController>('SolicitudSalaController')

const fechaFutura = (horas: number = 48) => new Date(Date.now() + horas * 3600000).toISOString();

const PLAN_BASE = {
    tipo: 'sala', normalizacionTiempo: 'mes', tarifa: 45000,
    categoriaAnexable: 'sala', esIntegrable: true, esNacional: true,
    cantUsuariosLinea: 16, cantUsuariosInvitados: 16,
    tiempoAlmacenamiento: 0, almacenamientoLocal: false,
};

const crearPlan = (nombre: string) =>
    request(app).post('/plan').send({ ...PLAN_BASE, nombre });

const crearPayload = (planNombre: string, planId: number, overrides: any = {}) => ({
    nombre: [planNombre],
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
    ...overrides,
});

const crearSolicitud = async (nombrePlan: string) => {
    const plan = await crearPlan(nombrePlan);
    const planId = plan.body.PlanBaseModel.id;
    const res = await request(app)
        .post('/solicitud/sala')
        .send(crearPayload(nombrePlan, planId));
    return res.body;
};

// ─── GET /solicitud/sala/:id ─────────────────────────
describe('GET /solicitud/sala/:id', () => {
    it('debe obtener una solicitud por su id de base', async () => {
        const creada = await crearSolicitud('Plan Get ID');
        
        // Obtener las solicitudes del documento para sacar el id real
        const docRes = await request(app).get(`/solicitud/sala/documento/${creada.data.documentoId}`);
        const solicitudId = docRes.body.data[0].id;

        const res = await request(app).get(`/solicitud/sala/${solicitudId}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.SolicitudBaseModel.estado).toBe('pendiente');
    });

    it('debe devolver 404 con id inexistente', async () => {
        const res = await request(app).get('/solicitud/sala/99999');
        expect(res.status).toBe(404);
    });
});

// ─── GET /solicitud/sala/documento/:documentoId ──────
describe('GET /solicitud/sala/documento/:documentoId', () => {
    it('debe obtener solicitudes por documento', async () => {
        const creada = await crearSolicitud('Plan Documento');
        const docId = creada.data.documentoId;

        const res = await request(app).get(`/solicitud/sala/documento/${docId}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(1);
        expect(res.body.data[0].SolicitudBaseModel.estado).toBe('pendiente');
    });

    it('debe devolver array vacío con documento inexistente', async () => {
        const res = await request(app).get('/solicitud/sala/documento/99999');
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
    });
});

// ─── GET /solicitud/sala/:name/:month/:year ──────────
describe('GET /solicitud/sala/:name/:month/:year - Calendario', () => {
    it('debe devolver calendario con solicitudes del mes', async () => {
        await crearSolicitud('Plan Calendario');

        const now = new Date(Date.now() + 48 * 3600000);
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const res = await request(app).get(`/solicitud/sala/Plan Calendario/${month}/${year}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(1);
        expect(res.body.data[0].plan.nombre).toBe('Plan Calendario');
    });

    it('debe devolver 404 sin solicitudes en el mes', async () => {
        const res = await request(app).get('/solicitud/sala/PlanInexistente/1/2026');
        expect(res.status).toBe(404);
    });
});

// ─── PUT /solicitud/sala/:id/cancelar ────────────────
describe('PUT /solicitud/sala/:id/cancelar', () => {
    it('debe cancelar una solicitud pendiente', async () => {
        await crearSolicitud('Plan Cancelar');
        const res = await request(app).put('/solicitud/sala/1/cancelar');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toMatch(/cancelada/);
    });

    it('debe rechazar cancelar solicitud inexistente', async () => {
        const res = await request(app).put('/solicitud/sala/99999/cancelar');
        expect(res.status).toBe(404);
    });
});

// ─── PUT /solicitud/sala/documento/:id/cancelar ──────
describe('PUT /solicitud/sala/documento/:documentoId/cancelar', () => {
    it('debe cancelar todas las solicitudes de un documento', async () => {
        const creada = await crearSolicitud('Plan Cancelar Doc');
        const docId = creada.data.documentoId;

        const res = await request(app).put(`/solicitud/sala/documento/${docId}/cancelar`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const verificacion = await request(app).get(`/solicitud/sala/documento/${docId}`);
        const estados = verificacion.body.data.map((s: any) => s.SolicitudBaseModel.estado);
        expect(estados.every((e: string) => e === 'anulado')).toBe(true);
    });

    it('debe devolver 404 con documento inexistente', async () => {
        const res = await request(app).put('/solicitud/sala/documento/99999/cancelar');
        expect(res.status).toBe(404);
    });
});

// ─── POST /solicitud/sala/disponibilidad (extras) ────
describe('POST /solicitud/sala/disponibilidad - Extras', () => {
    it('debe detectar solapamiento entre fechas diferentes', async () => {
        await crearPlan('Plan Solape');

        const res = await request(app)
            .post('/solicitud/sala/disponibilidad')
            .send({
                nombre: ['Plan Solape', 'Plan Solape'],
                fecha_inicio: [fechaFutura(48), fechaFutura(49)],
                fecha_fin: [fechaFutura(50), fechaFutura(51)],
            });

        expect(res.status).toBe(200);
        expect(res.body.data.some((d: any) => !d.valido)).toBe(true);
    });
});

describe('GET /solicitud/sala/calendario-operativo/:month/:year', () => {
        it('debe devolver 404 sin solicitudes en el mes', async () => {
            const res = await request(app).get('/solicitud/sala/calendario-operativo/5/2026');
            expect(res.status).toBe(404);
        });

        it('debe devolver solicitudes con entidad del cliente', async () => {
            // Crear plan + solicitud
            const plan = await request(app).post('/plan').send({
                tipo: 'sala', nombre: 'Plan Operativo', normalizacionTiempo: 'mes',
                tarifa: 45000, categoriaAnexable: 'sala', esIntegrable: true,
                esNacional: true, cantUsuariosLinea: 16, cantUsuariosInvitados: 16,
                tiempoAlmacenamiento: 0, almacenamientoLocal: false,
            });

            const fecha = new Date(Date.now() + 48 * 3600000);
            const month = fecha.getMonth() + 1;
            const year = fecha.getFullYear();

            await request(app).post('/solicitud/sala').send({
                nombre: ['Plan Operativo'],
                fecha_inicio: [fecha.toISOString()],
                fecha_fin: [new Date(fecha.getTime() + 2 * 3600000).toISOString()],
                numero: 12345678,
                link_vc: 'https://meet.test.com/op-' + Math.random().toString(36).slice(2, 7),
                nombre_solicitante: 'Juan Op',
                cargo: 'Director',
                entidad: 'Empresa Operativa',
                contrato_generalId: 1,
                contrato_especificoId: 1,
                correo: 'juan@test.com',
                planesSalaIds: [[plan.body.PlanBaseModel.id]],
                grabar: [false],
                info_contrato: {
                    agente: { nombre: 'A', apellido: 'B', unidad: 'TI', cargo: 'C', telefono: '55555555', correo: 'a@test.com' },
                    especialista: { nombre: 'E', telefono: '55555556', correo: 'e@test.com' },
                    ubicacion: { municipio: 'LH', provincia: 'LH' }
                },
            });

            const res = await request(app).get(`/solicitud/sala/calendario-operativo/${month}/${year}`);
            expect(res.status).toBe(200);
            expect(res.body.data.length).toBeGreaterThanOrEqual(1);
            expect(res.body.data[0].entidad).toBe('Empresa Operativa');
            expect(res.body.data[0].title).toBe('Plan Operativo');
        });
    });