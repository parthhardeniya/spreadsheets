# 📊 Spreadsheet Web Application

A web-based spreadsheet application that provides **Google Sheets-like functionalities**, including **cell editing, formula evaluation, and data formatting**.

---

## Features
- **Spreadsheet-like UI** with row and column headers
- **Formula Support** (`SUM`, `AVERAGE`, `MAX`, `MIN`, `COUNT`, `TRIM`, `UPPER`, `LOWER`)
- **Data Formatting** (Bold, Italic, Alignment)
- **Row & Column Operations** (Add/Delete Rows & Columns)
- **Find & Replace**, **Remove Duplicates**

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React.js** | Component-based UI, state management with hooks |
| **TypeScript** | Static typing for better maintainability |
| **Zustand** | Lightweight state management for spreadsheet data |
| **Tailwind CSS** | Utility-first styling for a responsive UI |
| **Lucide Icons** | Modern icons for toolbar UI |
| **Vite** | Fast bundling and development server |
| **Git & GitHub** | Version control and collaboration |

** Why this tech stack?**
- **React.js**: Handles UI efficiently with reusable components.  
- **Zustand**: Simple, minimal state management for handling spreadsheet data without Redux complexity.  
- **TypeScript**: Ensures type safety, making debugging easier.  
- **Tailwind CSS**: Speeds up styling and improves maintainability.  

---

##  Data Structures Used

| Data Structure | Usage |
|---------------|-------|
| **HashMap (Object in JS)** | Stores spreadsheet data efficiently (`cells: Record<string, CellType>`) |
| **2D Array (Virtual Grid)** | Represents row & column structure dynamically |
| **Linked List (History Stack - Optional)** | Manages undo/redo functionality |
| **Graph (Dependency Graph)** | Handles formula dependencies (`A1=A2+B2`) |

** Why these data structures?**
- **HashMap (Object)**: Fast key-value lookup for cell storage (`O(1)` access).  
- **2D Array**: Natural grid representation for spreadsheet structure.  
- **Graph**: Helps resolve **cell dependencies** in formulas dynamically.  
- **Linked List (Optional)**: Supports **undo/redo** operations efficiently.  

---

##  Project Setup

```sh
# Clone the repository
git clone https://github.com/parthhardeniya/spreadsheets.git

# Navigate to project directory
cd spreadsheets

# Install dependencies
npm install

# Start development server
npm run dev
