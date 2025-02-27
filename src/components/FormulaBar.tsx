import React, { useState, useEffect } from "react";
import { useSheetStore } from "../store/sheetStore";
import { evaluateFormula } from "./formulaEvaluator";

const FormulaBar: React.FC = () => {
  const { sheet, updateCellFormula, updateCellValue } = useSheetStore();
  const { selectedCell, cells } = sheet;

  const [inputValue, setInputValue] = useState("");

  /** Sync input field with the selected cell */
  useEffect(() => {
    if (selectedCell && cells[selectedCell]) {
      const cell = cells[selectedCell];
      setInputValue(cell.formula ? `=${cell.formula}` : cell.value?.toString() ?? "");
    } else {
      setInputValue("");
    }
  }, [selectedCell, cells]);

  /** Handles input change */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  /** Handles formula submission */
  const handleFormulaSubmit = () => {
    if (!selectedCell) return;

    let newFormula = inputValue.trim();

    if (newFormula.startsWith("=")) {
      // Remove '=' and store the formula part
      newFormula = newFormula.slice(1);

      // Evaluate the formula
      const evaluatedValue = evaluateFormula(newFormula, cells);

      // Update both formula and evaluated value in the sheet store
      updateCellFormula(selectedCell, newFormula);
      updateCellValue(selectedCell, evaluatedValue);
    } else {
      // If it's a normal value, update the cell value directly
      updateCellFormula(selectedCell, "");
      updateCellValue(selectedCell, newFormula);
    }
  };

  /** Handles Enter key submission */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleFormulaSubmit();
    }
  };

  return (
    <div className="flex items-center p-2 border-b border-gray-300 bg-gray-100">
      <div className="font-medium text-gray-700 px-3">fx</div>
      <input
        type="text"
        className="flex-1 border border-gray-300 rounded-md px-3 py-1 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleFormulaSubmit}
        onKeyDown={handleKeyDown}
        placeholder="Enter a formula (e.g., =SUM(A1:A5), =UPPER(A1))"
        disabled={!selectedCell}
      />
    </div>
  );
};

export default React.memo(FormulaBar);
