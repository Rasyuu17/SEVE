// src/tests/integration/flujo-tarifas.test.ts
process.env.NODE_ENV = 'test';

import './../setup'

import { container } from '../../../helpers/services.container';
container.register('RepoService', {
    subirPDF: jest.fn().mockResolvedValue({ success: true, url: 'https://repo.test/doc.pdf' }),
    obtenerPDF: jest.fn().mockResolvedValue(Buffer.from('fake-pdf')),
});

import request from 'supertest';
import app from '../../../app';

const fechaFutura = (horas: number = 48) => new Date(Date.now() + horas * 3600000).toISOString();

const PLAN_BASE = {
    tipo: 'sala', normalizacionTiempo: 'mes', tarifa: 45000,
    categoriaAnexable: 'sala', esIntegrable: true, esNacional: true,
    cantUsuariosLinea: 16, cantUsuariosInvitados: 16,
    tiempoAlmacenamiento: 0, almacenamientoLocal: false,
};

describe('Flujo: cambio de tarifa → confirmar documento', () => {
    jest.setTimeout(30000);

    it('debe versionar plan y confirmar documento al cambiar tarifa', async () => {
        const plan = await request(app).post('/plan').send({ ...PLAN_BASE, nombre: 'Plan Versionable' });
        const planId = plan.body.PlanBaseModel.id;

        const solicitud = await request(app).post('/solicitud/sala').send({
            nombre: ['Plan Versionable'],
            fecha_inicio: [fechaFutura(48)],
            fecha_fin: [fechaFutura(50)],
            numero: 12345678,
            link_vc: 'https://meet.test.com/version',
            nombre_solicitante: 'Juan Test',
            cargo: 'Director',
            entidad: 'Empresa Test',
            contrato_generalId: 1,
            contrato_especificoId: 1,
            correo: 'juan@test.com',
            planesSalaIds: [[planId]],
            grabar: [false],
            info_contrato: {
                agente: { nombre: 'A', apellido: 'B', unidad: 'TI', cargo: 'C', telefono: '55555555', correo: 'a@test.com' },
                especialista: { nombre: 'E', telefono: '55555556', correo: 'e@test.com' },
                ubicacion: { municipio: 'LH', provincia: 'LH' }
            },
        });
        const docId = solicitud.body.data.documentoId;

        const cambio = await request(app).post('/tasa/tarifas').send({
            cambios: [{ planId, tipo: 'sala', nuevaTarifa: 50000 }],
            nuevaTasa: 200,
        });
        expect(cambio.status).toBe(200);

        const doc = await request(app).get(`/documentos/${docId}/descargar`);
        
        const confirmar = await request(app).put(`/documentos/${docId}/sala/confirmar`);
        expect(confirmar.status).toBe(200);
        expect(confirmar.body.success).toBe(true);
    });
});