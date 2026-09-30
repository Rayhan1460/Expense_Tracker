import React, { useState } from 'react';
import { Calculator as CalcIcon, Delete } from 'lucide-react';

export default function Calculator({ onUseResult }) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleNumber = (num) => {
    setDisplay(display === '0' ? num : display + num);
  };

  const handleOperator = (op) => {
    if (display !== 'Error') {
      setEquation(display + ' ' + op + ' ');
      setDisplay('0');
    }
  };

  const calculate = () => {
    try {
      // eslint-disable-next-line no-new-func
      const result = new Function('return ' + equation + display)();
      setDisplay(String(result));
      setEquation('');
    } catch (e) {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };
  
  const backspace = () => {
    if (display !== 'Error' && display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  return (
    <div className="w-full glass-card p-8 rounded-3xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-full blur-3xl -mr-10 -mt-10"></div>
      
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center relative z-10">
        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3 shadow-inner">
          <CalcIcon className="w-5 h-5" />
        </div>
        Calculator
      </h2>
      
      <div className="relative z-10">
        <div className="bg-white/80 p-5 rounded-2xl mb-6 text-right border border-white shadow-inner">
          <div className="text-sm font-medium text-slate-400 min-h-[20px]">{equation}</div>
          <div className="text-4xl font-extrabold text-slate-900 truncate tracking-tight mt-1">{display}</div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          <button type="button" onClick={clear} className="col-span-2 depth-button bg-red-50 text-red-600 p-4 rounded-2xl font-bold text-lg hover:text-red-700">Clear</button>
          <button type="button" onClick={backspace} className="depth-button text-slate-600 p-4 rounded-2xl font-bold text-lg flex justify-center items-center"><Delete className="w-5 h-5" /></button>
          <button type="button" onClick={() => handleOperator('/')} className="depth-button text-indigo-600 p-4 rounded-2xl font-extrabold text-xl">÷</button>
          
          {[7, 8, 9].map(n => <button type="button" key={n} onClick={() => handleNumber(String(n))} className="depth-button text-slate-700 p-4 rounded-2xl font-bold text-xl">{n}</button>)}
          <button type="button" onClick={() => handleOperator('*')} className="depth-button text-indigo-600 p-4 rounded-2xl font-extrabold text-xl">×</button>
          
          {[4, 5, 6].map(n => <button type="button" key={n} onClick={() => handleNumber(String(n))} className="depth-button text-slate-700 p-4 rounded-2xl font-bold text-xl">{n}</button>)}
          <button type="button" onClick={() => handleOperator('-')} className="depth-button text-indigo-600 p-4 rounded-2xl font-extrabold text-xl">-</button>
          
          {[1, 2, 3].map(n => <button type="button" key={n} onClick={() => handleNumber(String(n))} className="depth-button text-slate-700 p-4 rounded-2xl font-bold text-xl">{n}</button>)}
          <button type="button" onClick={() => handleOperator('+')} className="depth-button text-indigo-600 p-4 rounded-2xl font-extrabold text-xl">+</button>
          
          <button type="button" onClick={() => handleNumber('0')} className="col-span-2 depth-button text-slate-700 p-4 rounded-2xl font-bold text-xl">0</button>
          <button type="button" onClick={() => handleNumber('.')} className="depth-button text-slate-700 p-4 rounded-2xl font-extrabold text-xl">.</button>
          <button type="button" onClick={calculate} className="depth-button-primary p-4 rounded-2xl font-extrabold text-2xl shadow-lg">=</button>
        </div>
        
        {onUseResult && (
          <button 
            type="button"
            onClick={() => {
              if (display !== 'Error' && !isNaN(parseFloat(display))) {
                onUseResult(display);
              }
            }}
            className="w-full depth-button text-slate-700 py-4 rounded-2xl font-bold text-lg"
          >
            Use as Expense Amount
          </button>
        )}
      </div>
    </div>
  );
}
