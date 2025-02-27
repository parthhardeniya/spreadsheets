import React from "react";
import { useSheetStore } from "../store/sheetStore";
import Cell from "./Cell";
import { getColumnLabel } from "../utils/helpers";

const Sheet: React.FC = () => {
  const { sheet } = useSheetStore();
  const { cells, rowCount, colCount } = sheet;

  const renderHeaderRow = () => {
    return (
      <div className="sticky top-0 left-0 z-20 flex bg-gray-100 shadow">
        {/* Top-left corner cell */}
        <div className="w-12 h-10 border border-gray-300 bg-gray-200"></div>

        {/* Column headers */}
        {Array.from({ length: colCount }, (_, col) => (
          <div
            key={`header-${col}`}
            className="w-24 h-10 flex items-center justify-center border border-gray-300 bg-gray-200 text-gray-700 font-medium"
          >
            {getColumnLabel(col)}
          </div>
        ))}
      </div>
    );
  };

  const renderRows = () => {
    return Array.from({ length: rowCount }, (_, row) => (
      <div key={`row-${row}`} className="flex">
        {/* Row Header */}
        <div className="w-12 h-10 flex items-center justify-center border border-gray-300 bg-gray-200 text-gray-700 font-medium sticky left-0 z-10">
          {row + 1}
        </div>

        {/* Cells */}
        {Array.from({ length: colCount }, (_, col) => {
          const cellId = `${getColumnLabel(col)}${row + 1}`;
          const cell = cells[cellId];

          return (
            <Cell
              key={cellId}
              cellId={cellId}
              cell={cell}
              className="w-24 h-10 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          );
        })}
      </div>
    ));
  };

  return (
    <div className="flex-1 overflow-auto bg-white shadow-md rounded-lg">
      <div className="inline-block">
        {renderHeaderRow()}
        {renderRows()}
      </div>
    </div>
  );
};

export default Sheet;
