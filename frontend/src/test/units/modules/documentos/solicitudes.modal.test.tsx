// src/test/units/modules/documentos/solicitudesModal.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SolicitudesModal } from '../../../../documentos/solicitudes.modal';
import { type Documento } from '../../../../documentos/documentos.interface';

const mockObtenerPorDocumento = vi.fn();
const mockCancelar = vi.fn();
const mockCancelarPorDocumento = vi.fn();
const mockObtenerTasa = vi.fn();

vi.mock('../../../../planes/planSala/solicitud/solicitudSala.client', () => ({
    solicitudApi: {
        obtenerPorDocumento: (...args: any[]) => mockObtenerPorDocumento(...args),
        cancelar: (...args: any[]) => mockCancelar(...args),
        cancelarPorDocumento: (...args: any[]) => mockCancelarPorDocumento(...args),
    },
}));

vi.mock('../../../../tasaCambio/tasaCambio.client', () => ({
    tasaApi: {
        obtenerTasa: (...args: any[]) => mockObtenerTasa(...args),
    },
}));

vi.mock('../../../../components/Modal', () => ({
    default: ({ children, isOpen, title, onClose }: any) => isOpen ? (
        <div>
            <h2>{title}</h2>
            <button onClick={onClose}>Cerrar</button>
            {children}
        </div>
    ) : null,
}));

vi.mock('../../../../utils/pagination', () => ({
    default: () => <div>Paginación</div>,
}));

const documentoMock = {
    id: 1,
    entidad: 'Empresa Test',
    tipo: 'solicitud_sala',
    numero: 12345678,
    nombre_solicitante: 'Juan',
    correo: 'juan@test.com',
    id_contratoGeneral: 1,
    id_contratoEspecifico: 1,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    direccion_original: '/path/doc.pdf',
    direccion_firmado: null,
    estado: 'confirmado',
} as Documento;

const solicitudMock = {
    SolicitudBaseModel: {
        id: 1,
        fecha_inicio: '2026-06-01T10:00:00',
        fecha_fin: '2026-06-01T12:00:00',
        estado: 'pendiente',
        confirmado: true,
    },
    PlanSalaModel: {
        PlanBaseModel: {
            nombre: 'Plan A',
            tarifa: 45000,
            TasaCambioModel: { tasa: 320 },
        },
    },
    PlanCombinadoModel: null,
};

describe('SolicitudesModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockObtenerTasa.mockResolvedValue({ data: { tasa: 320 } });
    });

    it('debe mostrar loading inicialmente', () => {
        mockObtenerPorDocumento.mockReturnValue(new Promise(() => {}));
        render(<SolicitudesModal documento={documentoMock} onClose={() => {}} />);
        expect(screen.getByText('Cargando solicitudes...')).toBeInTheDocument();
    });

    it('debe mostrar solicitudes cargadas', async () => {
        mockObtenerPorDocumento.mockResolvedValue({ data: { data: [solicitudMock] } });
        render(<SolicitudesModal documento={documentoMock} onClose={() => {}} />);
        await waitFor(() => {
            expect(screen.getByText('Plan A')).toBeInTheDocument();
        });
    });

    it('debe mostrar "No hay solicitudes" si viene vacío', async () => {
        mockObtenerPorDocumento.mockResolvedValue({ data: { data: [] } });
        render(<SolicitudesModal documento={documentoMock} onClose={() => {}} />);
        await waitFor(() => {
            expect(screen.getByText('No hay solicitudes asociadas')).toBeInTheDocument();
        });
    });

    it('debe mostrar tarifa en CUP', async () => {
        mockObtenerPorDocumento.mockResolvedValue({ data: { data: [solicitudMock] } });
        render(<SolicitudesModal documento={documentoMock} onClose={() => {}} />);
        await waitFor(() => {
            expect(screen.getByText('$450.00')).toBeInTheDocument();
        });
    });

    it('debe mostrar estado pendiente', async () => {
        mockObtenerPorDocumento.mockResolvedValue({ data: { data: [solicitudMock] } });
        render(<SolicitudesModal documento={documentoMock} onClose={() => {}} />);
        await waitFor(() => {
            expect(screen.getByText('pendiente')).toBeInTheDocument();
        });
    });

    it('debe mostrar botón cancelar todas si hay cancelables', async () => {
        mockObtenerPorDocumento.mockResolvedValue({ data: { data: [solicitudMock] } });
        render(<SolicitudesModal documento={documentoMock} onClose={() => {}} />);
        await waitFor(() => {
            expect(screen.getByText('Cancelar todas las solicitudes')).toBeInTheDocument();
        });
    });
});