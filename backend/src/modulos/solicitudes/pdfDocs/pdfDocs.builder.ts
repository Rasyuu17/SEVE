import PDFDocument from 'pdfkit';

import { PdfFontSize, PdfFontSizeParameter, PdfNewPage, PdfSpace, PdfTable, PdfTableParameter, PdfText, PdfTextParameter } from './pdfDocs.interface';

type OptionsMixedType = PdfText | PdfSpace | PdfFontSize | PdfTable | PdfNewPage;

export class PdfBuilder {
  private pdfOptions: PDFKit.PDFDocumentOptions;
  private itemsOptions: Array<OptionsMixedType> = [];

  constructor(pdfOptions?: PDFKit.PDFDocumentOptions) {
    this.pdfOptions = pdfOptions || { margin: 50 };
  }

  setText(content: string, element?: PdfTextParameter): this {
    const textElement = { ...element, type: 'text', content: content } as PdfText;
    this.itemsOptions.push(textElement);
    return this;
  }

  setSpace(times?: number): this {
    const spaceElement = { times: times || 1, type: 'space' } as PdfSpace;
    this.itemsOptions.push(spaceElement);
    return this;
  }

  setFontSize(element: PdfFontSizeParameter): this {
    const fontSizeElement = { ...element, type: 'font_size' } as PdfFontSize;
    this.itemsOptions.push(fontSizeElement);
    return this;
  }

  setTable(element: PdfTableParameter): this {
    const tableElement = { ...element, type: 'table' } as PdfTable;
    this.itemsOptions.push(tableElement);
    return this;
  }

  setNewPage(options?: { width?: number; height?: number; layout?: 'portrait' | 'landscape', margin?: number}): this {
    const newPageElement: PdfNewPage = { type: 'new_page', ...options };
    this.itemsOptions.push(newPageElement);
    return this;
  }

  build(): Promise<Buffer> {
    const doc = new PDFDocument(this.pdfOptions);
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));

    for (const item of this.itemsOptions) {
      this.render(item, doc);
    }

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });
  }

  private render(item: OptionsMixedType, doc: PDFKit.PDFDocument) {
    switch (item.type) {
      case 'text': this.renderText(item, doc); break;
      case 'font_size': this.changeFontSize(item, doc); break;
      case 'space': this.makeSpace(item, doc); break;
      case 'table': this.renderTable(item, doc); break;
      case 'new_page': this.renderNewPage(item, doc); break;
    }
  }

  private renderText(item: PdfText, doc: PDFKit.PDFDocument) {
    if (item.bold && item.italic) {
        doc.font('Helvetica-BoldOblique');
    } else if (item.bold) {
        doc.font('Helvetica-Bold');
    } else if (item.italic) {
        doc.font('Helvetica-Oblique');
    }
    
    doc.text(item.content, {
        continued: item.continue,
        align: item.align || 'justify',
    });
    
    doc.font('Helvetica');
}

  private makeSpace(item: PdfSpace, doc: PDFKit.PDFDocument) {
    doc.moveDown(item.times);
  }

  private changeFontSize(item: PdfFontSize, doc: PDFKit.PDFDocument) {
    doc.fontSize(item.value);
  }

  private renderTable(item: PdfTable, doc: PDFKit.PDFDocument) {
    const data = [...item.headers, ...item.rows];
    
    doc.table({
        data: data as any,
        ...(item.options || {}),
    });
  }

  private renderNewPage(item: PdfNewPage, doc: PDFKit.PDFDocument) {
    const options: any = {};
    if (item.width && item.height) {
        options.size = [item.width, item.height];
    }
    if (item.layout) {
        options.layout = item.layout;
    }
      options.margin = item.margin || 40
    doc.addPage(options);
  }
}