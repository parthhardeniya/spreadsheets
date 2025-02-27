import React, { useState } from 'react';
import { 
  Bold, Italic, AlignLeft, AlignCenter, AlignRight, 
  Plus, Trash2, Search, FileSpreadsheet
} from 'lucide-react';
import { useSheetStore } from '../store/sheetStore';
import { CellFormat } from '../types';

const Toolbar: React.FC = () => {
  const { sheet, updateCellFormat, addRow, deleteRow, addColumn, deleteColumn } = useSheetStore();
  const { selectedCell, selectedRange, cells } = sheet;
  
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showFindReplace, setShowFindReplace] = useState(false);
  
  const getSelectedCellFormat = (): CellFormat | null => {
    if (selectedCell && cells[selectedCell]) {
      return cells[selectedCell].format;
    }
    return null;
  };
  
  const handleFormatChange = (formatUpdate: Partial<CellFormat>) => {
    if (selectedCell) {
      updateCellFormat(selectedCell, formatUpdate);
    } else if (selectedRange) {
      selectedRange.forEach(cellId => {
        updateCellFormat(cellId, formatUpdate);
      });
    }
  };
  
  const handleFindReplace = () => {
    if (!selectedRange || !findText) return;
    
    import('../utils/formulaEvaluator').then(({ findAndReplace }) => {
      findAndReplace(selectedRange, cells, findText, replaceText);
      setShowFindReplace(false);
      setFindText('');
      setReplaceText('');
    });
  };
  
  const handleRemoveDuplicates = () => {
    if (!selectedRange) return;
    
    import('../utils/formulaEvaluator').then(({ removeDuplicates }) => {
      removeDuplicates(selectedRange, cells);
    });
  };
  
  const cellFormat = getSelectedCellFormat();
  const isDisabled = !selectedCell && !selectedRange;
  
  return (
    <div className="flex flex-col border-b border-gray-300">
      <div className="flex items-center p-1 bg-gray-100">
        <div className="flex items-center mr-4">
          <FileSpreadsheet className="w-5 h-5 mr-2 text-green-600" />
          <span className="font-medium">Sheets</span>
        </div>
        
        <div className="flex space-x-2 border-r border-gray-300 pr-2 mr-2">
          <button
            className={`p-1 rounded ${cellFormat?.bold ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
            onClick={() => handleFormatChange({ bold: !cellFormat?.bold })}
            disabled={isDisabled}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          
          <button
            className={`p-1 rounded ${cellFormat?.italic ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
            onClick={() => handleFormatChange({ italic: !cellFormat?.italic })}
            disabled={isDisabled}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex space-x-2 border-r border-gray-300 pr-2 mr-2">
          <button
            className={`p-1 rounded ${cellFormat?.textAlign === 'left' ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
            onClick={() => handleFormatChange({ textAlign: 'left' })}
            disabled={isDisabled}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          
          <button
            className={`p-1 rounded ${cellFormat?.textAlign === 'center' ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
            onClick={() => handleFormatChange({ textAlign: 'center' })}
            disabled={isDisabled}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          
          <button
            className={`p-1 rounded ${cellFormat?.textAlign === 'right' ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
            onClick={() => handleFormatChange({ textAlign: 'right' })}
            disabled={isDisabled}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex space-x-2 border-r border-gray-300 pr-2 mr-2">
          <button
            className="p-1 rounded hover:bg-gray-200"
            onClick={() => {
              if (selectedCell) {
                const { row } = cells[selectedCell];
                addRow(row);
              }
            }}
            disabled={!selectedCell}
            title="Add Row"
          >
            <Plus className="w-4 h-4" />
            <span className="ml-1 text-xs">Row</span>
          </button>
          
          <button
            className="p-1 rounded hover:bg-gray-200"
            onClick={() => {
              if (selectedCell) {
                const { row } = cells[selectedCell];
                deleteRow(row);
              }
            }}
            disabled={!selectedCell}
            title="Delete Row"
          >
            <Trash2 className="w-4 h-4" />
            <span className="ml-1 text-xs">Row</span>
          </button>
        </div>
        
        <div className="flex space-x-2 border-r border-gray-300 pr-2 mr-2">
          <button
            className="p-1 rounded hover:bg-gray-200"
            onClick={() => {
              if (selectedCell) {
                const { col } = cells[selectedCell];
                addColumn(col);
              }
            }}
            disabled={!selectedCell}
            title="Add Column"
          >
            <Plus className="w-4 h-4" />
            <span className="ml-1 text-xs">Column</span>
          </button>
          
          <button
            className="p-1 rounded hover:bg-gray-200"
            onClick={() => {
              if (selectedCell) {
                const { col } = cells[selectedCell];
                deleteColumn(col);
              }
            }}
            disabled={!selectedCell}
            title="Delete Column"
          >
            <Trash2 className="w-4 h-4" />
            <span className="ml-1 text-xs">Column</span>
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            className="p-1 rounded hover:bg-gray-200 flex items-center"
            onClick={() => setShowFindReplace(!showFindReplace)}
            title="Find and Replace"
          >
            <Search className="w-4 h-4" />
            <span className="ml-1">Find & Replace</span>
          </button>
          
          <button
            className="p-1 rounded hover:bg-gray-200 flex items-center"
            onClick={handleRemoveDuplicates}
            disabled={!selectedRange}
            title="Remove Duplicates"
          >
            <Trash2 className="w-4 h-4" />
            <span className="ml-1">Remove Duplicates</span>
          </button>
        </div>
      </div>
      
      {showFindReplace && (
        <div className="flex items-center p-2 bg-gray-50 border-t border-gray-200">
          <input
            type="text"
            placeholder="Find text"
            className="border border-gray-300 rounded px-2 py-1 mr-2"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
          />
          <input
            type="text"
            placeholder="Replace with"
            className="border border-gray-300 rounded px-2 py-1 mr-2"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            onClick={handleFindReplace}
          >
            Replace All
          </button>
        </div>
      )}
    </div>
  );
};

export default Toolbar;