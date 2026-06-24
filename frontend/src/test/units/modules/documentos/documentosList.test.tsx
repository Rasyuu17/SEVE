// src/test/units/modules/documentos/documentosList.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentoList } from '../../../../documentos/documentosList';

const mockBuscar = vi.fn();
const mockDescargar = vi.fn();
const mockSubirFirmado = vi.fn();
const mockConfirmar = vi.fn();
const mockCancelarPorDocumento = vi.fn();

vi.mock('../../../../documentos/documentos.client', () => ({
    documentoApi: {
        buscar: (...args: any[]) => mockBuscar(...args),
        descargar: (...args: any[]) => mockDescargar(...args),
        subirFirmado: (...args: any[]) => mockSubirFirmado(...args),
        confirmar: (...args: any[]) => mockConfirmar(...args),
    },
}));

vi.mock('../../../../planes/planSala/solicitud/solicitudSala.client', () => ({
    solicitudApi: {
        cancelarPorDocumento: (...args: any[]) => mockCancelarPorDocumento(...args),
    },
}));

vi.mock('react-router-dom', () => ({
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

vi.mock('../../../../documentos/documentosFilters', () => ({
    DocumentoFiltersComponent: ({ onSearch }: any) => (
        <button onClick={onSearch}>Buscar</button>
    ),
}));

vi.mock('../../../../documentos/solicitudes.modal', () => ({
    SolicitudesModal: ({ onClose }: any) => (
        <div>
            <span>Solicitudes Modal</span>
            <button onClick={onClose}>Cerrar Modal</button>
        </div>
    ),
}));

vi.mock('../../../../components/Modal', () => ({
    default: ({ children, isOpen, title }: any) => isOpen ? (
        <div>
            <span>{title}</span>
            {children}
        </div>
    ) : null,
}));

vi.mock('../../../../utils/pagination', () => ({
    default: () => <div>Paginación Mock</div>,
}));

const documentoBase = (overrides: any = {}) => ({
    id: 1,
    entidad: 'Empresa Test',
    nombre_solicitante: 'Juan Pérez',
    correo: 'juan@test.com',
    numero: 12345678,
    id_contratoGeneral: 1,
    id_contratoEspecifico: 1,
    createdAt: '2026-06-01',
    updatedAt: '2026-06-01',
    direccion_original: '/path/doc.pdf',
    direccion_firmado: null,
    estado: 'confirmado',
    tipo: 'solicitud_sala',
    ...overrides,
});

const respuestaMock = (documentos: any[]) => ({
    data: {
        data: documentos,
        pagination: { page: 1, totalPages: 1, total: documentos.length, limit: 7 },
    },
});

describe('DocumentoList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.URL.createObjectURL = vi.fn(() => 'blob:url');
        window.URL.revokeObjectURL = vi.fn();
    });

    it('debe mostrar mensaje sin documentos', async () => {
        mockBuscar.mockResolvedValue(respuestaMock([]));
        render(<DocumentoList />);
        await waitFor(() => {
            expect(screen.getByText('No se encontraron documentos')).toBeInTheDocument();
        });
    });

    it('debe mostrar documentos cargados', async () => {
        mockBuscar.mockResolvedValue(respuestaMock([documentoBase()]));
        render(<DocumentoList />);
        await waitFor(() => {
            expect(screen.getByText('Empresa Test')).toBeInTheDocument();
            expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
        });
    });

    it('debe mostrar estado "Sin firmar"', async () => {
        mockBuscar.mockResolvedValue(respuestaMock([documentoBase({ direccion_firmado: null })]));
        render(<DocumentoList />);
        await waitFor(() => {
            expect(screen.getByText('Sin firmar')).toBeInTheDocument();
        });
    });

    it('debe mostrar estado "Firmado"', async () => {
        mockBuscar.mockResolvedValue(respuestaMock([documentoBase({ direccion_firmado: '/firmado.pdf' })]));
        render(<DocumentoList />);
        await waitFor(() => {
            expect(screen.getByText('Firmado')).toBeInTheDocument();
        });
    });

    it('debe mostrar estado "Por confirmar"', async () => {
        mockBuscar.mockResolvedValue(respuestaMock([documentoBase({ estado: 'necesita confirmacion' })]));
        render(<DocumentoList />);
        await waitFor(() => {
            expect(screen.getByText('Por confirmar')).toBeInTheDocument();
        });
    });

    it('debe mostrar estado "Terminado"', async () => {
        mockBuscar.mockResolvedValue(respuestaMock([documentoBase({ estado: 'terminado' })]));
        render(<DocumentoList />);
        await waitFor(() => {
            expect(screen.getByText('Terminado')).toBeInTheDocument();
        });
    });

    it('debe abrir modal de solicitudes al hacer clic en Ver', async () => {
        mockBuscar.mockResolvedValue(respuestaMock([documentoBase()]));
        render(<DocumentoList />);
        await waitFor(() => expect(screen.getByText('Empresa Test')).toBeInTheDocument());
        
        const verBtn = screen.getByTitle('Ver solicitudes');
        await userEvent.click(verBtn);
        
        expect(screen.getByText('Solicitudes Modal')).toBeInTheDocument();
    });

    it('debe mostrar botones Confirmar/Rechazar si necesita confirmacion', async () => {
        mockBuscar.mockResolvedValue(respuestaMock([documentoBase({ estado: 'necesita confirmacion' })]));
        render(<DocumentoList />);
        await waitFor(() => expect(screen.getByText('Por confirmar')).toBeInTheDocument());
        
        expect(screen.getByTitle('Confirmar cambios')).toBeInTheDocument();
        expect(screen.getByTitle('Rechazar cambios')).toBeInTheDocument();
    });
});