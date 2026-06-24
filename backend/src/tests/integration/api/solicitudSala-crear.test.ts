// src/tests/integration/solicitudesSala-crear.test.ts
process.env.NODE_ENV = 'test';

import './../setup'

// Mock antes de que el container instancie nada
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
    tipo: 'sala',
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

const crearPlan = (nombre: string) => request(app).post('/plan').send({ ...PLAN_BASE, nombre });

const crearPayload = (planNombre: string, planId: number, overrides: any = {}) => ({
    nombre: [planNombre],
    fecha_inicio: [fechaFutura(48)],
    fecha_fin: [fechaFutura(50)],
    numero: 12345678,
    link_vc: 'https://meet.test.com/room-' + Math.random().toString(36).slice(2, 7),
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
            nombre: 'Agente',
            apellido: 'Prueba',
            unidad: 'TI',
            cargo: 'Especialista',
            telefono: '55555555',
            correo: 'agente@test.com'
        },
        especialista: {
            nombre: 'Especialista',
            telefono: '55555556',
            correo: 'esp@test.com'
        },
        ubicacion: {
            municipio: 'La Habana',
            provincia: 'La Habana'
        }
    },
    ...overrides,
});

describe('POST /solicitud/sala - Creación completa', () => {
    jest.setTimeout(15000);

    it('debe crear una solicitud simple correctamente', async () => {
        const plan = await crearPlan('Plan Solicitud Simple');
        const planId = plan.body.PlanBaseModel.id;

        const res = await request(app)
            .post('/solicitud/sala')
            .send(crearPayload('Plan Solicitud Simple', planId));

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.documentoId).toBeDefined();
        expect(res.body.data.entidad).toBe('Empresa Test');
    });

    it('debe rechazar link duplicado', async () => {
        const plan = await crearPlan('Plan Link Test');
        const planId = plan.body.PlanBaseModel.id;
        const link = 'https://meet.test.com/duplicado-test';

        const payload = crearPayload('Plan Link Test', planId, { link_vc: link });

        await request(app).post('/solicitud/sala').send(payload);
        const res = await request(app).post('/solicitud/sala').send(payload);

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/ya está en uso/);
    });

    it('debe rechazar plan inexistente', async () => {
        const res = await request(app)
            .post('/solicitud/sala')
            .send(crearPayload('Plan Fantasma', 99999));

        expect(res.status).toBe(409);
        expect(res.body.message).toMatch(/no están disponibles/);
    });

    it('debe rechazar por conflicto de horario', async () => {
        const plan = await crearPlan('Plan Conflictivo');
        const planId = plan.body.PlanBaseModel.id;

        const payload = crearPayload('Plan Conflictivo', planId);

        await request(app).post('/solicitud/sala').send(payload);

        const res = await request(app).post('/solicitud/sala').send(
            crearPayload('Plan Conflictivo', planId, {
                link_vc: 'https://meet.test.com/otro-link',
            })
        );

        expect(res.status).toBe(409);
        expect(res.body.message).toMatch(/no están disponibles/);
    });

    it('debe fallar sin campo nombre', async () => {
        const { nombre, ...sinNombre } = crearPayload('Plan Test', 1);
        const res = await request(app)
            .post('/solicitud/sala')
            .send(sinNombre);

        expect(res.status).toBe(400);
    });
});

describe('POST /solicitud/sala - Planes combinados', () => {
    jest.setTimeout(15000);

    it('debe crear una solicitud con plan combinado', async () => {
        const plan1 = await crearPlan('Plan Combinado A');
        const plan2 = await crearPlan('Plan Combinado B');
        const id1 = plan1.body.PlanBaseModel.id;
        const id2 = plan2.body.PlanBaseModel.id;

        const res = await request(app)
            .post('/solicitud/sala')
            .send(crearPayload('Plan Combinado A&&Plan Combinado B', id1, {
                nombre: ['Plan Combinado A&&Plan Combinado B'],
                planesSalaIds: [[id1, id2]],
                link_vc: 'https://meet.test.com/combinado-' + Math.random().toString(36).slice(2, 7),
            }));

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.documentoId).toBeDefined();
    });

    it('debe rechazar plan combinado con planes inexistentes', async () => {
        const res = await request(app)
            .post('/solicitud/sala')
            .send(crearPayload('Plan Fantasma A&&Plan Fantasma B', 1, {
                nombre: ['Plan Fantasma A&&Plan Fantasma B'],
                planesSalaIds: [[99998, 99999]],
                link_vc: 'https://meet.test.com/fantasma-' + Math.random().toString(36).slice(2, 7),
            }));

        expect(res.status).toBe(409);
        expect(res.body.message).toMatch(/no están disponibles/);
    });

    it('debe rechazar plan combinado donde un plan no existe', async () => {
        const plan1 = await crearPlan('Plan Real');
        const id1 = plan1.body.PlanBaseModel.id;

        const res = await request(app)
            .post('/solicitud/sala')
            .send(crearPayload('Plan Real&&Plan Falso', id1, {
                nombre: ['Plan Real&&Plan Falso'],
                planesSalaIds: [[id1, 99999]],
                link_vc: 'https://meet.test.com/mixto-' + Math.random().toString(36).slice(2, 7),
            }));

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/no están disponibles/);
    });
});

describe('GET /solicitud/sala/:id - Solicitud creada', () => {
    it('debe obtener una solicitud simple creada', async () => {
        const plan = await crearPlan('Plan Get Test');
        const planId = plan.body.PlanBaseModel.id;

        const created = await request(app)
            .post('/solicitud/sala')
            .send(crearPayload('Plan Get Test', planId));

        const res = await request(app).get(`/solicitud/sala/${created.body.data.documentoId}`);
        expect(res.status).toBe(200);
    });

    it('debe obtener una solicitud con plan combinado', async () => {
        const plan1 = await crearPlan('Plan Get A');
        const plan2 = await crearPlan('Plan Get B');
        const id1 = plan1.body.PlanBaseModel.id;
        const id2 = plan2.body.PlanBaseModel.id;

        const created = await request(app)
            .post('/solicitud/sala')
            .send(crearPayload('Plan Get A&&Plan Get B', id1, {
                nombre: ['Plan Get A&&Plan Get B'],
                planesSalaIds: [[id1, id2]],
                link_vc: 'https://meet.test.com/get-combi-' + Math.random().toString(36).slice(2, 7),
            }));

        const res = await request(app).get(`/solicitud/sala/${created.body.data.documentoId}`);
        expect(res.status).toBe(200);
    });
});