export interface PdfText {
  type: 'text';
  content: string;
  bold?: boolean;
  italic?: boolean; 
  continue?: boolean;
  align?: 'left' | 'right' | 'center' | 'justify';
}

export interface PdfTextParameter extends Omit<PdfText, 'type' | 'content'> {}

export interface PdfTextParameter extends Omit<PdfText, 'type' | 'content'> {}

export interface PdfFontSize {
  type: 'font_size';
  value: number;
}

export interface PdfNewPage {
    type: 'new_page';
    width?: number;
    height?: number;
    layout?: 'portrait' | 'landscape';
    margin?: number
}

export interface PdfFontSizeParameter extends Omit<PdfFontSize, 'type'> {}

export interface PdfSpace {
  type: 'space';
  times: number;
}

export interface TableCell {
  text: string;
  colSpan?: number;
  rowSpan?: number;
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;
  backgroundColor?: string;
  align?: 'left' | 'right' | 'center' | 'justify';
  border?: boolean;
}

export interface PdfTable {
  type: 'table';
  headers: TableCell[][];
  rows: TableCell[][];
  options?: {
    x?: number;
    y?: number;
    width?: number;
    defaultColWidth?: number;
    cellPadding?: number;
    border?: boolean;
    headerBg?: string;
    striped?: boolean;
  };
}

export interface PdfTableParameter extends Omit<PdfTable, 'type'> {}

export interface VerificacionFirma {
  valido: boolean;
  autenticidad: boolean;
  integridad: boolean;
  expirado: boolean;
  cantidadFirmas: number;
  certificados: any[];
  error?: string;
}

export enum DocumentDiscriminator {
  SOLICITUD_SALA = 'solicitud_sala',
}