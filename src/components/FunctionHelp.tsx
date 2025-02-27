import React, { useState, useCallback, useEffect, useMemo } from "react";
import { HelpCircle,  } from "lucide-react";

const FunctionHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleHelp = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeHelp = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeHelp();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeHelp]);

  const functions = useMemo(
    () => [
      {
        category: "Mathematical Functions",
        items: [
          { name: "SUM", syntax: "=SUM(range)", description: "Calculates the sum of a range of cells." },
          { name: "AVERAGE", syntax: "=AVERAGE(range)", description: "Calculates the average of a range of cells." },
          { name: "MAX", syntax: "=MAX(range)", description: "Returns the maximum value from a range of cells." },
          { name: "MIN", syntax: "=MIN(range)", description: "Returns the minimum value from a range of cells." },
          { name: "COUNT", syntax: "=COUNT(range)", description: "Counts the number of cells containing numerical values in a range." },
        ],
      },
      {
        category: "Data Quality Functions",
        items: [
          { name: "TRIM", syntax: "=TRIM(cell)", description: "Removes leading and trailing whitespace from a cell." },
          { name: "UPPER", syntax: "=UPPER(cell)", description: "Converts the text in a cell to uppercase." },
          { name: "LOWER", syntax: "=LOWER(cell)", description: "Converts the text in a cell to lowercase." },
        ],
      },
      {
        category: "Special Operations",
        items: [
          { name: "Remove Duplicates", syntax: 'Select range and click "Remove Duplicates"', description: "Removes duplicate rows from a selected range." },
          { name: "Find and Replace", syntax: 'Select range and click "Find & Replace"', description: "Allows you to find and replace specific text within a range of cells." },
        ],
      },
    ],
    []
  );

  return (
    <div className="relative">
      {/* Floating Help Button */}
      <button
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={toggleHelp}
        title="Function Help"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* Help Modal */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-300 max-h-[80vh] overflow-auto z-50">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-gray-50 sticky top-0">
            <h2 className="text-lg font-semibold">Function Reference</h2>
            <button onClick={closeHelp} className="text-gray-500 hover:text-gray-700 focus:outline-none">
              {/* <X className="w-5 h-5" /> */}
            </button>
          </div>

          {/* Function Categories */}
          <div className="p-4">
            {functions.map((category, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-md font-semibold mb-2 text-blue-600">{category.category}</h3>
                <div className="space-y-3">
                  {category.items.map((func, funcIndex) => (
                    <div key={funcIndex} className="border-b border-gray-200 pb-2">
                      <div className="font-medium">{func.name}</div>
                      <div className="text-sm font-mono bg-gray-100 p-1 rounded my-1">{func.syntax}</div>
                      <div className="text-sm text-gray-600">{func.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Quick Tips Section */}
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <h4 className="font-medium text-blue-700">Quick Tips:</h4>
              <ul className="text-sm text-gray-700 list-disc pl-5 mt-1 space-y-1">
                <li>Start formulas with an equals sign (=)</li>
                <li>Select a range using colon (e.g., A1:B5)</li>
                <li>Double-click a cell to edit its contents</li>
                <li>Use Shift+Click to select a range of cells</li>
                <li>Drag cells to copy their contents</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(FunctionHelp);
