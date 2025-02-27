import { Cell, CellValue } from '../types';
import { isNumeric, parseCellId } from './helpers';

// Mathematical functions
const mathFunctions = {
  SUM: (values: CellValue[]): number => {
    return values
      .filter(v => isNumeric(v))
      .reduce((sum, v) => sum + Number(v), 0);
  },
  
  AVERAGE: (values: CellValue[]): number => {
    const numericValues = values.filter(v => isNumeric(v));
    if (numericValues.length === 0) return 0;
    return mathFunctions.SUM(numericValues) / numericValues.length;
  },
  
  MAX: (values: CellValue[]): number => {
    const numericValues = values.filter(v => isNumeric(v)).map(v => Number(v));
    if (numericValues.length === 0) return 0;
    return Math.max(...numericValues);
  },
  
  MIN: (values: CellValue[]): number => {
    const numericValues = values.filter(v => isNumeric(v)).map(v => Number(v));
    if (numericValues.length === 0) return 0;
    return Math.min(...numericValues);
  },
  
  COUNT: (values: CellValue[]): number => {
    return values.filter(v => isNumeric(v)).length;
  },
};

// Data quality functions
const dataQualityFunctions = {
  TRIM: (value: CellValue): string => {
    if (value === null) return '';
    return String(value).trim();
  },
  
  UPPER: (value: CellValue): string => {
    if (value === null) return '';
    return String(value).toUpperCase();
  },
  
  LOWER: (value: CellValue): string => {
    if (value === null) return '';
    return String(value).toLowerCase();
  },
};

// Parse a cell range like "A1:B3" into an array of cell IDs
const parseCellRange = (range: string): string[] => {
  const [start, end] = range.split(':');
  if (!start || !end) return [range];
  
  const startPos = parseCellId(start);
  const endPos = parseCellId(end);
  
  const startRow = Math.min(startPos.row, endPos.row);
  const endRow = Math.max(startPos.row, endPos.row);
  const startCol = Math.min(startPos.col, endPos.col);
  const endCol = Math.max(startPos.col, endPos.col);
  
  const cellIds: string[] = [];
  
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const colLabel = String.fromCharCode(65 + col);
      cellIds.push(`${colLabel}${row + 1}`);
    }
  }
  
  return cellIds;
};

// Get cell values from a range
const getCellValuesFromRange = (range: string, cells: Record<string, Cell>): CellValue[] => {
  const cellIds = parseCellRange(range);
  return cellIds.map(id => cells[id]?.value ?? null);
};

// Evaluate a formula
export const evaluateFormula = (formula: string, cells: Record<string, Cell>): CellValue => {
  try {
    // Check for SUM function
    const sumMatch = formula.match(/SUM\(([A-Z0-9:]+)\)/i);
    if (sumMatch) {
      const range = sumMatch[1];
      const values = getCellValuesFromRange(range, cells);
      return mathFunctions.SUM(values);
    }
    
    // Check for AVERAGE function
    const avgMatch = formula.match(/AVERAGE\(([A-Z0-9:]+)\)/i);
    if (avgMatch) {
      const range = avgMatch[1];
      const values = getCellValuesFromRange(range, cells);
      return mathFunctions.AVERAGE(values);
    }
    
    // Check for MAX function
    const maxMatch = formula.match(/MAX\(([A-Z0-9:]+)\)/i);
    if (maxMatch) {
      const range = maxMatch[1];
      const values = getCellValuesFromRange(range, cells);
      return mathFunctions.MAX(values);
    }
    
    // Check for MIN function
    const minMatch = formula.match(/MIN\(([A-Z0-9:]+)\)/i);
    if (minMatch) {
      const range = minMatch[1];
      const values = getCellValuesFromRange(range, cells);
      return mathFunctions.MIN(values);
    }
    
    // Check for COUNT function
    const countMatch = formula.match(/COUNT\(([A-Z0-9:]+)\)/i);
    if (countMatch) {
      const range = countMatch[1];
      const values = getCellValuesFromRange(range, cells);
      return mathFunctions.COUNT(values);
    }
    
    // Check for TRIM function
    const trimMatch = formula.match(/TRIM\(([A-Z0-9]+)\)/i);
    if (trimMatch) {
      const cellId = trimMatch[1];
      const value = cells[cellId]?.value ?? null;
      return dataQualityFunctions.TRIM(value);
    }
    
    // Check for UPPER function
    const upperMatch = formula.match(/UPPER\(([A-Z0-9]+)\)/i);
    if (upperMatch) {
      const cellId = upperMatch[1];
      const value = cells[cellId]?.value ?? null;
      return dataQualityFunctions.UPPER(value);
    }
    
    // Check for LOWER function
    const lowerMatch = formula.match(/LOWER\(([A-Z0-9]+)\)/i);
    if (lowerMatch) {
      const cellId = lowerMatch[1];
      const value = cells[cellId]?.value ?? null;
      return dataQualityFunctions.LOWER(value);
    }
    
    // If it's a cell reference like A1
    if (/^[A-Z]+\d+$/.test(formula)) {
      return cells[formula]?.value ?? null;
    }
    
    // Try to evaluate as a mathematical expression
    // Replace cell references with their values
    let expression = formula;
    const cellRefs = formula.match(/[A-Z]+\d+/g) || [];
    
    for (const cellRef of cellRefs) {
      const cellValue = cells[cellRef]?.value;
      if (cellValue === null || cellValue === undefined) {
        expression = expression.replace(new RegExp(cellRef, 'g'), '0');
      } else if (isNumeric(cellValue)) {
        expression = expression.replace(new RegExp(cellRef, 'g'), cellValue.toString());
      } else {
        expression = expression.replace(new RegExp(cellRef, 'g'), '0');
      }
    }
    
    // Safely evaluate the expression
    try {
      // Basic validation to prevent malicious code execution
      if (!/^[0-9+\-*/() .]+$/.test(expression)) {
        return '#ERROR: Invalid expression';
      }
      
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${expression}`)();
      return isNumeric(result) ? Number(result) : result;
    } catch (evalError) {
      console.error('Expression evaluation error:', evalError);
      return '#ERROR: Invalid calculation';
    }
  } catch (error) {
    console.error('Formula evaluation error:', error);
    return '#ERROR!';
  }
};

// Function to remove duplicates from a range
export const removeDuplicates = (range: string[], cells: Record<string, Cell>): void => {
  // Group cells by row
  const rowGroups: Record<number, string[]> = {};
  
  range.forEach(cellId => {
    const cell = cells[cellId];
    if (!cell) return;
    
    const { row } = cell;
    if (!rowGroups[row]) {
      rowGroups[row] = [];
    }
    rowGroups[row].push(cellId);
  });
  
  // Get unique rows based on their values
  const uniqueRows = new Map<string, number>();
  
  Object.entries(rowGroups).forEach(([rowIndex, cellIds]) => {
    const rowValues = cellIds.map(id => cells[id]?.value ?? null).join('|');
    uniqueRows.set(rowValues, parseInt(rowIndex, 10));
  });
  
  // Clear duplicate rows
  Object.entries(rowGroups).forEach(([rowIndex, cellIds]) => {
    const rowValues = cellIds.map(id => cells[id]?.value ?? null).join('|');
    const uniqueRowIndex = uniqueRows.get(rowValues);
    
    if (uniqueRowIndex !== parseInt(rowIndex, 10)) {
      // This is a duplicate row, clear its values
      cellIds.forEach(id => {
        if (cells[id]) {
          cells[id].value = null;
          cells[id].formula = '';
        }
      });
    }
  });
};

// Function to find and replace text in a range
export const findAndReplace = (
  range: string[],
  cells: Record<string, Cell>,
  findText: string,
  replaceText: string
): void => {
  range.forEach(cellId => {
    const cell = cells[cellId];
    if (cell && typeof cell.value === 'string') {
      cell.value = cell.value.replace(new RegExp(findText, 'g'), replaceText);
    }
  });
};