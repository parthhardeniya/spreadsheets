import React from 'react';
import Toolbar from './components/Toolbar';
import FormulaBar from './components/FormulaBar';
import Sheet from './components/Sheet';
import FunctionHelp from './components/FunctionHelp';

function App() {
  return (
    <div className="flex flex-col h-screen bg-white">
      <Toolbar />
      <FormulaBar />
      <Sheet />
      <FunctionHelp />
    </div>
  );
}

export default App;