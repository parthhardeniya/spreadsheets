import React, { useState, useEffect, useRef } from "react";
import { useSheetStore } from "../store/sheetStore";
import { Cell as CellType } from "../types";
import { isNumeric } from "../utils/helpers";

interface CellProps {
  cellId: string;
  cell: CellType;
  className:string;
}

const Cell: React.FC<CellProps> = ({ cellId, cell ,className}) => {
  const {
    sheet,
    selectCell,
    updateCellValue,
    startDragging,
    endDragging,
    selectRange,
  } = useSheetStore();

  const { selectedCell, selectedRange, isDragging } = sheet;

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isSelected = selectedCell === cellId;
  const isInRange = selectedRange?.includes(cellId) || false;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  /** Handles cell selection & range selection */
  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) {
      endDragging(cellId);
      return;
    }

    if (e.shiftKey && selectedCell) {
      selectRange(selectedCell, cellId);
    } else {
      selectCell(cellId);
    }
  };

  /** Handles cell editing */
  const handleDoubleClick = () => {
    setEditing(true);
    setEditValue(cell.formula || cell.value?.toString() || "");
  };

  /** Saves value & exits edit mode */
  const handleBlur = () => {
    setEditing(false);
    if (!cell.formula && editValue !== (cell.value?.toString() || "")) {
      const numericValue = isNumeric(editValue) ? parseFloat(editValue) : editValue;
      updateCellValue(cellId, numericValue);
    }
  };

  /** Handles Enter & Escape key actions */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setEditing(false);
    }
  };

  /** Handles drag events */
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", cellId);
    startDragging(cellId);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    endDragging(cellId);
  };

  /** Returns cell content */
  const getCellContent = () => {
    return cell.value ?? "";
  };

  /** Returns cell style */
  const getCellStyle = () => ({
    fontWeight: cell.format.bold ? "bold" : "normal",
    fontStyle: cell.format.italic ? "italic" : "normal",
    fontSize: `${cell.format.fontSize}px`,
    color: cell.format.color,
    backgroundColor: isSelected ? "#e8f0fe" : isInRange ? "#f1f8ff" : cell.format.backgroundColor,
    textAlign: cell.format.textAlign,
    minWidth: "100px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    cursor: "pointer",
  });

  return (
    <div
      className={`${className}border border-gray-300 ${isSelected ? "border-2 border-blue-500" : ""} ${
        isInRange ? "bg-blue-50" : ""
      }`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      draggable
      onDragStart={handleDragStart}
      onDrop={handleDrop}
      style={getCellStyle()}
    >
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          className="w-full h-full px-1 outline-none bg-white"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div className="w-full h-full px-1">{getCellContent()}</div>
      )}
    </div>
  );
};

export default React.memo(Cell);
