import './../../helpers/mocks/models'
import { PdfDocService } from '../../../modulos/solicitudes/pdfDocs/pdfDocs.service';

// Mock de verify-pdf
jest.mock('@qlever-llc/verify-pdf', () => ({
    verifyPDF: jest.fn(),
    getCertificatesInfoFromPDF: jest.fn(),
}));

import { verifyPDF, getCertificatesInfoFromPDF } from '@qlever-llc/verify-pdf';

describe('PdfDocService - validarFirma', () => {
    let service: PdfDocService;

    beforeAll(() => {
        service = new PdfDocService({} as any, {} as any);
    });

    it('debe rechazar PDF sin firmas', async () => {
        (verifyPDF as jest.Mock).mockReturnValue({
            verified: false,
            authenticity: false,
            integrity: false,
            expired: false,
            signatures: [],
        });

        const result = await service.validarFirma(Buffer.from('fake'));
        expect(result.valido).toBe(false);
        expect(result.error).toContain('Debe tener 2 firmas');
    });

    it('debe rechazar PDF con 1 firma', async () => {
        (verifyPDF as jest.Mock).mockReturnValue({
            verified: true,
            authenticity: true,
            integrity: true,
            expired: false,
            signatures: [{}, {}], // 2 firmas pero...
        });
        // Forzar 1 firma
        (verifyPDF as jest.Mock).mockReturnValueOnce({
            verified: true,
            authenticity: true,
            integrity: true,
            expired: false,
            signatures: [{}], // 1 firma
        });

        const result = await service.validarFirma(Buffer.from('fake'));
        expect(result.valido).toBe(false);
    });

    it('debe rechazar si integrity es false', async () => {
        (verifyPDF as jest.Mock).mockReturnValue({
            verified: true,
            authenticity: true,
            integrity: false,
            expired: false,
            signatures: [{}, {}],
        });

        const result = await service.validarFirma(Buffer.from('fake'));
        expect(result.integridad).toBe(false);
    });

    it('debe aceptar PDF con 2 firmas válidas', async () => {
        (verifyPDF as jest.Mock).mockReturnValue({
            verified: true,
            authenticity: true,
            integrity: true,
            expired: false,
            signatures: [{}, {}],
        });
        (getCertificatesInfoFromPDF as jest.Mock).mockReturnValue([{ cert: 1 }, { cert: 2 }]);

        const result = await service.validarFirma(Buffer.from('fake'));
        expect(result.valido).toBe(true);
        expect(result.cantidadFirmas).toBe(2);
    });
});