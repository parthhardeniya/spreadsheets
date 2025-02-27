import { create } from 'zustand';
import { Cell, CellFormat, CellValue, SheetData } from '../types';
import { evaluateFormula } from '../utils/formulaEvaluator';
import { generateCellId } from '../utils/helpers';

const DEFAULT_ROW_COUNT = 100;
const DEFAULT_COL_COUNT = 26; // A to Z

const DEFAULT_CELL_FORMAT: CellFormat = {
  bold: false,
  italic: false,
  fontSize: 12,
  color: '#000000',
  backgroundColor: '#ffffff',
  textAlign: 'left',
};

const createEmptyCell = (row: number, col: number): Cell => ({
  id: generateCellId(row, col),
  value: null,
  formula: '',
  format: { ...DEFAULT_CELL_FORMAT },
  row,
  col,
});

const initializeSheet = (): SheetData => {
  const cells: Record<string, Cell> = {};
  
  for (let row = 0; row < DEFAULT_ROW_COUNT; row++) {
    for (let col = 0; col < DEFAULT_COL_COUNT; col++) {
      const cellId = generateCellId(row, col);
      cells[cellId] = createEmptyCell(row, col);
    }
  }
  
  return {
    cells,
    rowCount: DEFAULT_ROW_COUNT,
    colCount: DEFAULT_COL_COUNT,
    selectedCell: null,
    selectedRange: null,
    isDragging: false,
    dragStartCell: null,
  };
};

export const useSheetStore = create<{
  sheet: SheetData;
  selectCell: (cellId: string) => void;
  selectRange: (startCellId: string, endCellId: string) => void;
  updateCellValue: (cellId: string, value: CellValue) => void;
  updateCellFormula: (cellId: string, formula: string) => void;
  updateCellFormat: (cellId: string, format: Partial<CellFormat>) => void;
  addRow: (afterRow: number) => void;
  deleteRow: (row: number) => void;
  addColumn: (afterCol: number) => void;
  deleteColumn: (col: number) => void;
  startDragging: (cellId: string) => void;
  endDragging: (targetCellId: string) => void;
  cancelDragging: () => void;
  recalculateFormulas: () => void;
}>((set, get) => ({
  sheet: initializeSheet(),
  
  selectCell: (cellId: string) => {
    set((state) => ({
      sheet: {
        ...state.sheet,
        selectedCell: cellId,
        selectedRange: null,
      },
    }));
  },
  
  selectRange: (startCellId: string, endCellId: string) => {
    const { sheet } = get();
    const startCell = sheet.cells[startCellId];
    const endCell = sheet.cells[endCellId];
    
    if (!startCell || !endCell) return;
    
    const startRow = Math.min(startCell.row, endCell.row);
    const endRow = Math.max(startCell.row, endCell.row);
    const startCol = Math.min(startCell.col, endCell.col);
    const endCol = Math.max(startCell.col, endCell.col);
    
    const selectedRange: string[] = [];
    
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        selectedRange.push(generateCellId(row, col));
      }
    }
    
    set((state) => ({
      sheet: {
        ...state.sheet,
        selectedRange,
        selectedCell: null,
      },
    }));
  },
  
  updateCellValue: (cellId: string, value: CellValue) => {
    set((state) => {
      const updatedCells = { ...state.sheet.cells };
      
      // Make sure the cell exists
      if (!updatedCells[cellId]) {
        const { row, col } = parseCellId(cellId);
        updatedCells[cellId] = createEmptyCell(row, col);
      }
      
      updatedCells[cellId] = {
        ...updatedCells[cellId],
        value,
        formula: '',
      };
      
      return {
        sheet: {
          ...state.sheet,
          cells: updatedCells,
        },
      };
    });
    
    // Recalculate formulas that might depend on this cell
    get().recalculateFormulas();
  },
  
  updateCellFormula: (cellId: string, formula: string) => {
    set((state) => {
      const updatedCells = { ...state.sheet.cells };
      
      // Make sure the cell exists
      if (!updatedCells[cellId]) {
        const { row, col } = parseCellId(cellId);
        updatedCells[cellId] = createEmptyCell(row, col);
      }
      
      let value: CellValue = formula;
      
      if (formula.startsWith('=')) {
        try {
          value = evaluateFormula(formula.substring(1), state.sheet.cells);
        } catch (error) {
          console.error('Formula evaluation error:', error);
          value = '#ERROR!';
        }
      }
      
      updatedCells[cellId] = {
        ...updatedCells[cellId],
        formula: formula.startsWith('=') ? formula : '',
        value: formula.startsWith('=') ? value : formula,
      };
      
      return {
        sheet: {
          ...state.sheet,
          cells: updatedCells,
        },
      };
    });
    
    // Recalculate formulas that might depend on this cell
    get().recalculateFormulas();
  },
  
  updateCellFormat: (cellId: string, format: Partial<CellFormat>) => {
    set((state) => {
      const updatedCells = { ...state.sheet.cells };
      
      // Make sure the cell exists
      if (!updatedCells[cellId]) {
        const { row, col } = parseCellId(cellId);
        updatedCells[cellId] = createEmptyCell(row, col);
      }
      
      updatedCells[cellId] = {
        ...updatedCells[cellId],
        format: {
          ...updatedCells[cellId].format,
          ...format,
        },
      };
      
      return {
        sheet: {
          ...state.sheet,
          cells: updatedCells,
        },
      };
    });
  },
  
  addRow: (afterRow: number) => {
    set((state) => {
      const { cells, rowCount } = state.sheet;
      const updatedCells = { ...cells };
      
      // Shift rows down
      for (let row = rowCount - 1; row > afterRow; row--) {
        for (let col = 0; col < state.sheet.colCount; col++) {
          const oldCellId = generateCellId(row, col);
          const newCellId = generateCellId(row + 1, col);
          
          if (cells[oldCellId]) {
            updatedCells[newCellId] = {
              ...cells[oldCellId],
              id: newCellId,
              row: row + 1,
            };
          }
        }
      }
      
      // Add new row
      for (let col = 0; col < state.sheet.colCount; col++) {
        const newCellId = generateCellId(afterRow + 1, col);
        updatedCells[newCellId] = createEmptyCell(afterRow + 1, col);
      }
      
      return {
        sheet: {
          ...state.sheet,
          cells: updatedCells,
          rowCount: rowCount + 1,
        },
      };
    });
    
    get().recalculateFormulas();
  },
  
  deleteRow: (row: number) => {
    set((state) => {
      const { cells, rowCount } = state.sheet;
      const updatedCells = { ...cells };
      
      // Remove the row
      for (let col = 0; col < state.sheet.colCount; col++) {
        const cellId = generateCellId(row, col);
        delete updatedCells[cellId];
      }
      
      // Shift rows up
      for (let r = row + 1; r < rowCount; r++) {
        for (let col = 0; col < state.sheet.colCount; col++) {
          const oldCellId = generateCellId(r, col);
          const newCellId = generateCellId(r - 1, col);
          
          if (cells[oldCellId]) {
            updatedCells[newCellId] = {
              ...cells[oldCellId],
              id: newCellId,
              row: r - 1,
            };
            delete updatedCells[oldCellId];
          }
        }
      }
      
      return {
        sheet: {
          ...state.sheet,
          cells: updatedCells,
          rowCount: rowCount - 1,
          selectedCell: null,
          selectedRange: null,
        },
      };
    });
    
    get().recalculateFormulas();
  },
  
  addColumn: (afterCol: number) => {
    set((state) => {
      const { cells, colCount } = state.sheet;
      const updatedCells = { ...cells };
      
      // Shift columns right
      for (let col = colCount - 1; col > afterCol; col--) {
        for (let row = 0; row < state.sheet.rowCount; row++) {
          const oldCellId = generateCellId(row, col);
          const newCellId = generateCellId(row, col + 1);
          
          if (cells[oldCellId]) {
            updatedCells[newCellId] = {
              ...cells[oldCellId],
              id: newCellId,
              col: col + 1,
            };
          }
        }
      }
      
      // Add new column
      for (let row = 0; row < state.sheet.rowCount; row++) {
        const newCellId = generateCellId(row, afterCol + 1);
        updatedCells[newCellId] = createEmptyCell(row, afterCol + 1);
      }
      
      return {
        sheet: {
          ...state.sheet,
          cells: updatedCells,
          colCount: colCount + 1,
        },
      };
    });
    
    get().recalculateFormulas();
  },
  
  deleteColumn: (col: number) => {
    set((state) => {
      const { cells, colCount } = state.sheet;
      const updatedCells = { ...cells };
      
      // Remove the column
      for (let row = 0; row < state.sheet.rowCount; row++) {
        const cellId = generateCellId(row, col);
        delete updatedCells[cellId];
      }
      
      // Shift columns left
      for (let c = col + 1; c < colCount; c++) {
        for (let row = 0; row < state.sheet.rowCount; row++) {
          const oldCellId = generateCellId(row, c);
          const newCellId = generateCellId(row, c - 1);
          
          if (cells[oldCellId]) {
            updatedCells[newCellId] = {
              ...cells[oldCellId],
              id: newCellId,
              col: c - 1,
            };
            delete updatedCells[oldCellId];
          }
        }
      }
      
      return {
        sheet: {
          ...state.sheet,
          cells: updatedCells,
          colCount: colCount - 1,
          selectedCell: null,
          selectedRange: null,
        },
      };
    });
    
    get().recalculateFormulas();
  },
  
  startDragging: (cellId: string) => {
    set((state) => ({
      sheet: {
        ...state.sheet,
        isDragging: true,
        dragStartCell: cellId,
      },
    }));
  },
  
  endDragging: (targetCellId: string) => {
    const { sheet } = get();
    const { dragStartCell } = sheet;
    
    if (!dragStartCell || dragStartCell === targetCellId) {
      set((state) => ({
        sheet: {
          ...state.sheet,
          isDragging: false,
          dragStartCell: null,
        },
      }));
      return;
    }
    
    const sourceCell = sheet.cells[dragStartCell];
    
    // Copy cell content to target
    set((state) => {
      const updatedCells = { ...state.sheet.cells };
      
      // Make sure the target cell exists
      if (!updatedCells[targetCellId]) {
        const { row, col } = parseCellId(targetCellId);
        updatedCells[targetCellId] = createEmptyCell(row, col);
      }
      
      updatedCells[targetCellId] = {
        ...updatedCells[targetCellId],
        value: sourceCell.value,
        formula: sourceCell.formula,
      };
      
      return {
        sheet: {
          ...state.sheet,
          cells: updatedCells,
          isDragging: false,
          dragStartCell: null,
        },
      };
    });
    
    get().recalculateFormulas();
  },
  
  cancelDragging: () => {
    set((state) => ({
      sheet: {
        ...state.sheet,
        isDragging: false,
        dragStartCell: null,
      },
    }));
  },
  
  recalculateFormulas: () => {
    set((state) => {
      const updatedCells = { ...state.sheet.cells };
      
      // Find all cells with formulas and recalculate them
      Object.keys(updatedCells).forEach((cellId) => {
        const cell = updatedCells[cellId];
        if (cell.formula && cell.formula.startsWith('=')) {
          try {
            const value = evaluateFormula(cell.formula.substring(1), updatedCells);
            updatedCells[cellId] = {
              ...cell,
              value,
            };
          } catch (error) {
            console.error('Formula recalculation error:', error);
            updatedCells[cellId] = {
              ...cell,
              value: '#ERROR!',
            };
          }
        }
      });
      
      return {
        sheet: {
          ...state.sheet,
          cells: updatedCells,
        },
      };
    });
  },
}));

// Import this here to avoid circular dependency
import { parseCellId } from '../utils/helpers';