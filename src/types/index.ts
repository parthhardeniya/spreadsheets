export type CellValue = string | number | null;

export type CellFormat = {
  bold: boolean;
  italic: boolean;
  fontSize: number;
  color: string;
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right';
};

export type Cell = {
  id: string;
  value: CellValue;
  formula: string;
  format: CellFormat;
  row: number;
  col: number;
};

export type SheetData = {
  cells: Record<string, Cell>;
  rowCount: number;
  colCount: number;
  selectedCell: string | null;
  selectedRange: string[] | null;
  isDragging: boolean;
  dragStartCell: string | null;
};