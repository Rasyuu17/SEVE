// src/tests/integration/link.test.ts
process.env.NODE_ENV = 'test';

import './../setup'

import { container } from '../../../helpers/services.container';
container.register('RepoService', {
    subirPDF: jest.fn().mockResolvedValue({ success: true, url: 'https://repo.test/doc.pdf' }),
    obtenerPDF: jest.fn().mockResolvedValue(Buffer.from('fake-pdf')),
});

import request from 'supertest';
import app from '../../../app';

describe('GET /link/:link', () => {
    it('debe devolver disponible para link no usado', async () => {
        const link = encodeURIComponent('https://meet.test.com/nuevo');
        const res = await request(app).get(`/link/${link}`);
        expect(res.status).toBe(200);
        expect(res.body.response).toBe(true);
    });

    it('debe devolver no disponible para link existente', async () => {
        const plan = await request(app).post('/plan').send({
            tipo: 'sala', nombre: 'Plan Link Test', normalizacionTiempo: 'mes',
            tarifa: 45000, categoriaAnexable: 'sala', esIntegrable: true,
            esNacional: true, cantUsuariosLinea: 16, cantUsuariosInvitados: 16,
            tiempoAlmacenamiento: 0, almacenamientoLocal: false,
        });

        await request(app).post('/solicitud/sala').send({
            nombre: ['Plan Link Test'],
            fecha_inicio: [new Date(Date.now() + 48 * 3600000).toISOString()],
            fecha_fin: [new Date(Date.now() + 50 * 3600000).toISOString()],
            numero: 12345678,
            link_vc: 'https://meet.test.com/ocupado',
            nombre_solicitante: 'Juan Test',
            cargo: 'Director',
            entidad: 'Empresa Test',
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

        const link = encodeURIComponent('https://meet.test.com/ocupado');
        const res = await request(app).get(`/link/${link}`);
        expect(res.status).toBe(200);
        expect(res.body.response).toBe(false);
    });
});