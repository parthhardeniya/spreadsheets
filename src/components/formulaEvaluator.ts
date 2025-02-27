export const evaluateFormula = (formula: string, cells: Record<string, any>) => {
    try {
      if (!formula) return "";
  
      // Extract the content inside the function (A1, A1:A5, etc.)
      const extracted = extractContent(formula);
  
      if (!extracted) return "ERROR";
  
      // Handle SUM function
      if (formula.startsWith("SUM(")) return sumRange(extracted.start, extracted.end, cells);
  
      // Handle AVERAGE function
      if (formula.startsWith("AVERAGE(")) return averageRange(extracted.start, extracted.end, cells);
  
      // Handle MAX function
      if (formula.startsWith("MAX(")) return maxRange(extracted.start, extracted.end, cells);
  
      // Handle MIN function
      if (formula.startsWith("MIN(")) return minRange(extracted.start, extracted.end, cells);
  
      // Handle COUNT function
      if (formula.startsWith("COUNT(")) return countRange(extracted.start, extracted.end, cells);
  
      // Handle TRIM function
      if (formula.startsWith("TRIM(")) return trimText(extracted.start, cells);
  
      // Handle UPPER function
      if (formula.startsWith("UPPER(")) return upperText(extracted.start, cells);
  
      // Handle LOWER function
      if (formula.startsWith("LOWER(")) return lowerText(extracted.start, cells);
  
      // Handle basic arithmetic (e.g., A1 + A2)
      const sanitizedFormula = formula.replace(/([A-Z]+\d+)/g, (match) => {
        return cells[match]?.value || "0";
      });
  
      return eval(sanitizedFormula); // Use cautiously; replace with a safer parsing logic if needed
    } catch (error) {
      return "ERROR";
    }
  };
  
  /** Extracts start and end of range from formula (e.g., "A1:A5") */
  const extractContent = (formula: string) => {
    const rangeMatch = formula.match(/\((.*?)\)/);
    if (!rangeMatch) return null;
  
    const [start, end] = rangeMatch[1].split(":");
    return { start, end: end || start };
  };
  
  /** Function to sum a range of cells */
  const sumRange = (start: string, end: string, cells: Record<string, any>) =>
    getRangeValues(start, end, cells).reduce((acc, val) => acc + val, 0);
  
  /** Function to calculate the average of a range */
  const averageRange = (start: string, end: string, cells: Record<string, any>) => {
    const values = getRangeValues(start, end, cells);
    return values.length ? sumRange(start, end, cells) / values.length : 0;
  };
  
  /** Function to get the maximum value in a range */
  const maxRange = (start: string, end: string, cells: Record<string, any>) => Math.max(...getRangeValues(start, end, cells));
  
  /** Function to get the minimum value in a range */
  const minRange = (start: string, end: string, cells: Record<string, any>) => Math.min(...getRangeValues(start, end, cells));
  
  /** Function to count the number of non-empty values in a range */
  const countRange = (start: string, end: string, cells: Record<string, any>) => getRangeValues(start, end, cells).length;
  
  /** Function to trim a cell's text */
  const trimText = (cellId: string, cells: Record<string, any>) => cells[cellId]?.value?.toString().trim() || "";
  
  /** Function to convert text to uppercase */
  const upperText = (cellId: string, cells: Record<string, any>) => cells[cellId]?.value?.toString().toUpperCase() || "";
  
  /** Function to convert text to lowercase */
  const lowerText = (cellId: string, cells: Record<string, any>) => cells[cellId]?.value?.toString().toLowerCase() || "";
  
  /** Convert column letters (A, B, C, ... AA, AB) to numbers */
  const columnToNumber = (col: string): number => {
    let num = 0;
    for (let i = 0; i < col.length; i++) {
      num = num * 26 + (col.charCodeAt(i) - 64); // 'A' is 65 in ASCII
    }
    return num;
  };
  
  /** Convert column numbers back to letters (e.g., 1 -> A, 26 -> Z, 27 -> AA) */
  const numberToColumn = (num: number): string => {
    let col = "";
    while (num > 0) {
      let remainder = (num - 1) % 26;
      col = String.fromCharCode(65 + remainder) + col;
      num = Math.floor((num - 1) / 26);
    }
    return col;
  };
  
  /** Get values from a cell range */
  const getRangeValues = (start: string, end: string, cells: Record<string, any>) => {
    const startCol = columnToNumber(start.match(/[A-Z]+/g)?.[0] || "");
    const startRow = parseInt(start.match(/\d+/g)?.[0] || "0");
    const endCol = columnToNumber(end.match(/[A-Z]+/g)?.[0] || "");
    const endRow = parseInt(end.match(/\d+/g)?.[0] || "");
  
    let values: any[] = [];
  
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const cellId = `${numberToColumn(col)}${row}`;
        values.push(parseFloat(cells[cellId]?.value) || 0);
      }
    }
  
    return values;
  };
  