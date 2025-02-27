export const generateCellId = (row: number, col: number): string => {
  return `${getColumnLabel(col)}${row + 1}`;
};

export const getColumnLabel = (col: number): string => {
  let label = '';
  let c = col;
  
  do {
    const remainder = c % 26;
    label = String.fromCharCode(65 + remainder) + label;
    c = Math.floor(c / 26) - 1;
  } while (c >= 0);
  
  return label;
};

export const parseCellId = (cellId: string): { row: number; col: number } => {
  const match = cellId.match(/([A-Z]+)(\d+)/);
  if (!match) {
    return { row: 0, col: 0 };
  }
  
  const colLabel = match[1];
  const rowLabel = match[2];
  
  const row = parseInt(rowLabel, 10) - 1;
  let col = 0;
  
  for (let i = 0; i < colLabel.length; i++) {
    col = col * 26 + (colLabel.charCodeAt(i) - 64);
  }
  
  return { row, col: col - 1 };
};

export const isNumeric = (value: any): boolean => {
  if (typeof value === 'number') return true;
  if (typeof value !== 'string') return false;
  return !isNaN(parseFloat(value)) && isFinite(Number(value));
};

export const formatNumber = (value: number): string => {
  return value.toString();
};