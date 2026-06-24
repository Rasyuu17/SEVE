// src/tests/unit/schemas/documentoFilter.schema.test.ts
import { documentoFilterSchema } from '../../../modulos/solicitudes/pdfDocs/pdfDocs.schemas';

describe('documentoFilterSchema', () => {
    it('acepta filtro vacío (todos opcionales)', () => {
        const r = documentoFilterSchema.safeParse({});
        expect(r.success).toBe(true);
    });

    it('acepta búsqueda por entidad', () => {
        const r = documentoFilterSchema.safeParse({ entidad: 'MINED' });
        expect(r.success).toBe(true);
        expect(r.data!.entidad).toBe('MINED');
    });

    it('transforma numero string a number', () => {
        const r = documentoFilterSchema.safeParse({ numero: '12345678' });
        expect(r.success).toBe(true);
        expect(r.data!.numero).toBe(12345678);
    });

    it('rechaza numero negativo', () => {
        const r = documentoFilterSchema.safeParse({ numero: '-1' });
        expect(r.success).toBe(false);
    });

    it('transforma page y limit a numbers con defaults', () => {
        const r = documentoFilterSchema.safeParse({});
        expect(r.data!.page).toBe(1);
        expect(r.data!.limit).toBe(7);
    });

    it('rechaza correo inválido', () => {
        const r = documentoFilterSchema.safeParse({ correo: 'no-es-correo' });
        expect(r.success).toBe(false);
    });

    it('acepta correo vacío', () => {
        const r = documentoFilterSchema.safeParse({ correo: '' });
        expect(r.success).toBe(true);
    });

    it('rechaza search mayor a 100 caracteres', () => {
        const r = documentoFilterSchema.safeParse({ search: 'a'.repeat(101) });
        expect(r.success).toBe(false);
    });

    it('acepta orderBy y orderDir válidos', () => {
        const r = documentoFilterSchema.safeParse({ orderBy: 'entidad', orderDir: 'ASC' });
        expect(r.success).toBe(true);
        expect(r.data!.orderBy).toBe('entidad');
        expect(r.data!.orderDir).toBe('ASC');
    });

    it('rechaza orderBy inválido', () => {
        const r = documentoFilterSchema.safeParse({ orderBy: 'invalido' });
        expect(r.success).toBe(false);
    });

    it('acepta fechas', () => {
        const r = documentoFilterSchema.safeParse({ fechaDesde: '2026-01-01', fechaHasta: '2026-12-31' });
        expect(r.success).toBe(true);
    });

    it('acepta fechas vacías', () => {
        const r = documentoFilterSchema.safeParse({ fechaDesde: '', fechaHasta: '' });
        expect(r.success).toBe(true);
    });
});