import './../../helpers/mocks/models'
import { PdfBuilder } from '../../../modulos/solicitudes/pdfDocs/pdfDocs.builder';

describe('PdfBuilder', () => {
    let builder: PdfBuilder;

    beforeEach(() => {
        builder = new PdfBuilder();
    });

    describe('setText', () => {
        it('debe agregar un item de tipo text', () => {
            builder.setText('Hola');
            const items = (builder as any).itemsOptions;
            expect(items).toHaveLength(1);
            expect(items[0]).toMatchObject({ type: 'text', content: 'Hola' });
        });

        it('debe aceptar opciones bold y align', () => {
            builder.setText('Título', { bold: true, align: 'center' });
            const items = (builder as any).itemsOptions;
            expect(items[0]).toMatchObject({ type: 'text', content: 'Título', bold: true, align: 'center' });
        });

        it('debe aceptar continue', () => {
            builder.setText('Parte 1', { continue: true });
            const items = (builder as any).itemsOptions;
            expect(items[0].continue).toBe(true);
        });
    });

    describe('setSpace', () => {
        it('debe agregar espacio con default 1', () => {
            builder.setSpace();
            const items = (builder as any).itemsOptions;
            expect(items[0]).toMatchObject({ type: 'space', times: 1 });
        });

        it('debe aceptar múltiples espacios', () => {
            builder.setSpace(3);
            const items = (builder as any).itemsOptions;
            expect(items[0].times).toBe(3);
        });
    });

    describe('setFontSize', () => {
        it('debe cambiar tamaño de fuente', () => {
            builder.setFontSize({ value: 14 });
            const items = (builder as any).itemsOptions;
            expect(items[0]).toMatchObject({ type: 'font_size', value: 14 });
        });
    });

    describe('setNewPage', () => {
        it('debe agregar nueva página sin opciones', () => {
            builder.setNewPage();
            const items = (builder as any).itemsOptions;
            expect(items[0]).toMatchObject({ type: 'new_page' });
        });

        it('debe aceptar dimensiones y layout', () => {
            builder.setNewPage({ width: 612, height: 792, layout: 'portrait' });
            const items = (builder as any).itemsOptions;
            expect(items[0]).toMatchObject({ type: 'new_page', width: 612, height: 792, layout: 'portrait' });
        });
    });

    describe('setTable', () => {
        it('debe agregar tabla con headers y rows', () => {
            builder.setTable({
                headers: [[{ text: 'Nombre', bold: true }]],
                rows: [[{ text: 'Valor' }]],
            });
            const items = (builder as any).itemsOptions;
            expect(items[0]).toMatchObject({ type: 'table' });
            expect(items[0].headers).toHaveLength(1);
            expect(items[0].rows).toHaveLength(1);
        });

        it('debe aceptar options', () => {
            builder.setTable({
                headers: [],
                rows: [],
                options: { width: 500, border: false },
            });
            const items = (builder as any).itemsOptions;
            expect(items[0].options).toMatchObject({ width: 500, border: false });
        });
    });

    describe('encadenamiento', () => {
        it('debe permitir encadenar métodos', () => {
            builder
                .setFontSize({ value: 12 })
                .setText('Hola', { bold: true })
                .setSpace()
                .setText('Mundo');

            const items = (builder as any).itemsOptions;
            expect(items).toHaveLength(4);
            expect(items.map((i: any) => i.type)).toEqual(['font_size', 'text', 'space', 'text']);
        });
    });

    describe('build', () => {
        it('debe devolver un Buffer', async () => {
            builder.setText('Test');
            const result = await builder.build();
            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        });

        it('debe generar PDF con tabla', async () => {
            builder.setTable({
                headers: [[{ text: 'A', bold: true }, { text: 'B', bold: true }]],
                rows: [[{ text: '1' }, { text: '2' }]],
            });
            const result = await builder.build();
            expect(result.length).toBeGreaterThan(100);
        });

        it('debe generar PDF con nueva página', async () => {
            builder.setText('Página 1').setNewPage().setText('Página 2');
            const result = await builder.build();
            expect(result.length).toBeGreaterThan(100);
        });
    });
});