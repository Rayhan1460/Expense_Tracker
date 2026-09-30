import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Plus, Wallet, TrendingUp, Calendar, Hash, 
  Trash2, Edit2, History, Calculator as CalcIcon,
  Menu, X
} from 'lucide-react';
import { format, isToday, isThisMonth, parseISO } from 'date-fns';
import Calculator from './components/Calculator';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Education', 'Other'];

export default function App() {
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  // Mobile Nav State
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    document.title = "ET — Expense Tracker";
  }, [expenses]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) return;

    const expenseData = {
      id: editingId || uuidv4(),
      amount: parseFloat(amount),
      category,
      date,
      note,
      createdAt: new Date().toISOString()
    };

    if (editingId) {
      setExpenses(expenses.map(ex => ex.id === editingId ? expenseData : ex));
      setEditingId(null);
    } else {
      setExpenses([expenseData, ...expenses]);
    }

    // Reset form
    setAmount('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory(CATEGORIES[0]);
  };

  const handleEdit = (expense) => {
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDate(expense.date);
    setNote(expense.note);
    setEditingId(expense.id);
    document.getElementById('add-expense').scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      setExpenses(expenses.filter(ex => ex.id !== id));
    }
  };

  const scrollTo = (id) => {
    setMobileNavOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Stats calculation
  const todayTotal = expenses
    .filter(ex => isToday(parseISO(ex.date)))
    .reduce((sum, ex) => sum + ex.amount, 0);

  const monthTotal = expenses
    .filter(ex => isThisMonth(parseISO(ex.date)))
    .reduce((sum, ex) => sum + ex.amount, 0);
    
  const totalExpensesAmount = expenses.reduce((sum, ex) => sum + ex.amount, 0);

  // Predictions
  const daysWithData = new Set(expenses.map(ex => ex.date)).size;
  const avgDaily = daysWithData > 0 ? expenses.reduce((sum, ex) => sum + ex.amount, 0) / daysWithData : 0;
  const predictedMonthly = avgDaily * 30;
  const predictedYearly = avgDaily * 365;

  return (
    <div className="min-h-screen flex flex-col font-sans relative z-0">
      
      {/* Background 3D Orbs */}
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-0 rounded-b-2xl mx-4 mt-2 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center cursor-pointer" onClick={() => scrollTo('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-[0_4px_10px_rgba(79,70,229,0.3)] mr-3 transform transition-transform hover:scale-105">
            ET
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight hidden sm:block">Expense Tracker</span>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-1 bg-slate-100/50 p-1 rounded-xl">
          <NavButton onClick={() => scrollTo('dashboard')}>Dashboard</NavButton>
          <NavButton onClick={() => scrollTo('add-expense')}>Add Expense</NavButton>
          <NavButton onClick={() => scrollTo('calculator')}>Calculator</NavButton>
        </div>

        {/* Mobile Nav Toggle */}
        <button 
          className="md:hidden p-2 text-slate-600 bg-white/50 rounded-lg"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          {mobileNavOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Nav Menu */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm md:hidden pt-24 px-4" onClick={() => setMobileNavOpen(false)}>
          <div className="glass-panel p-4 rounded-2xl flex flex-col space-y-2" onClick={e => e.stopPropagation()}>
            <MobileNavButton onClick={() => scrollTo('dashboard')}>Dashboard</MobileNavButton>
            <MobileNavButton onClick={() => scrollTo('add-expense')}>Add Expense</MobileNavButton>
            <MobileNavButton onClick={() => scrollTo('calculator')}>Calculator</MobileNavButton>
          </div>
        </div>
      )}

      <main className="flex-grow pt-28 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-16">
        
        {/* DASHBOARD SECTION */}
        <section id="dashboard" className="scroll-mt-28">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2 drop-shadow-sm">Overview</h1>
            <p className="text-slate-600 font-medium">Your financial summary at a glance.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard title="Today's Total" amount={todayTotal} icon={<Calendar className="text-blue-500 w-6 h-6" />} color="blue" />
            <StatCard title="This Month's Total" amount={monthTotal} icon={<Wallet className="text-indigo-500 w-6 h-6" />} color="indigo" />
            <StatCard title="Total Expenses" amount={totalExpensesAmount} icon={<Hash className="text-purple-500 w-6 h-6" />} color="purple" />
          </div>
          
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-slate-600" /> Spending Estimates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <EstimateCard title="Estimated Monthly" amount={predictedMonthly} />
            <EstimateCard title="Estimated Yearly" amount={predictedYearly} />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ADD EXPENSE SECTION */}
          <div className="lg:col-span-1 space-y-8">
            <section id="add-expense" className="scroll-mt-28 glass-card p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
              
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 shadow-inner">
                  <Plus className="w-5 h-5" />
                </div>
                {editingId ? 'Edit Expense' : 'Add Expense'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Amount (BDT)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-lg">৳</span>
                    <input 
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="depth-input w-full pl-10 pr-4 py-3 rounded-xl font-medium outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="depth-input w-full px-4 py-3 rounded-xl font-medium outline-none appearance-none"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Date</label>
                  <input 
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="depth-input w-full px-4 py-3 rounded-xl font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Note</label>
                  <input 
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="depth-input w-full px-4 py-3 rounded-xl font-medium outline-none"
                    placeholder="What was this for?"
                  />
                </div>

                <button 
                  type="submit"
                  className="depth-button-primary w-full py-3.5 rounded-xl font-bold text-lg mt-4 flex justify-center items-center"
                >
                  {editingId ? 'Update Expense' : 'Add Expense'}
                </button>
                {editingId && (
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setAmount('');
                      setNote('');
                    }}
                    className="depth-button w-full text-slate-600 font-bold py-3 rounded-xl mt-3"
                  >
                    Cancel
                  </button>
                )}
              </form>
            </section>

            {/* CALCULATOR SECTION */}
            <section id="calculator" className="scroll-mt-28">
              <Calculator 
                onUseResult={(val) => {
                  setAmount(val);
                  document.getElementById('add-expense').scrollIntoView({ behavior: 'smooth' });
                }} 
              />
            </section>
          </div>

          {/* HISTORY SECTION */}
          <div className="lg:col-span-2">
            <section id="history" className="glass-card p-6 md:p-8 rounded-3xl h-full">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 shadow-inner">
                    <History className="w-5 h-5" />
                  </div>
                  Recent Expenses
                </h2>
                <div className="px-3 py-1 bg-white/60 border border-white rounded-lg shadow-sm text-sm font-semibold text-slate-600">
                  {expenses.length} Entries
                </div>
              </div>
              
              {expenses.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white/50 shadow-inner flex items-center justify-center mb-6">
                    <Wallet className="w-12 h-12 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">No expenses yet</h3>
                  <p className="text-slate-500 max-w-xs">Start tracking your spending by adding your first expense.</p>
                </div>
              ) : (
                <div className="overflow-x-auto pb-4">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b-2 border-slate-200/50">
                        <th className="py-4 px-2 font-bold text-slate-500 text-xs uppercase tracking-wider">Date</th>
                        <th className="py-4 px-2 font-bold text-slate-500 text-xs uppercase tracking-wider">Category</th>
                        <th className="py-4 px-2 font-bold text-slate-500 text-xs uppercase tracking-wider">Note</th>
                        <th className="py-4 px-2 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Amount (BDT)</th>
                        <th className="py-4 px-2 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50">
                      {expenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-white/40 transition-colors group">
                          <td className="py-5 px-2 text-slate-700 font-medium text-sm whitespace-nowrap">
                            {format(parseISO(expense.date), 'MMM d, yyyy')}
                          </td>
                          <td className="py-5 px-2">
                            <span className="px-3 py-1 bg-white border border-slate-200/60 shadow-sm text-slate-700 rounded-lg text-xs font-bold">
                              {expense.category}
                            </span>
                          </td>
                          <td className="py-5 px-2 text-slate-600 text-sm font-medium">
                            {expense.note || <span className="text-slate-400 italic">No note</span>}
                          </td>
                          <td className="py-5 px-2 text-right font-bold text-slate-900 whitespace-nowrap text-base">
                            ৳ {expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-5 px-2 text-right whitespace-nowrap">
                            <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleEdit(expense)}
                                className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDelete(expense.id)}
                                className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-red-600 hover:border-red-200 transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-20 pb-8 text-center relative z-10">
        <p className="text-sm font-medium text-slate-500">
          Made by <span className="font-bold text-slate-700">Rayhan Parvaz</span>
        </p>
      </footer>
    </div>
  );
}

function NavButton({ children, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="px-5 py-2 rounded-lg font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all text-sm"
    >
      {children}
    </button>
  );
}

function MobileNavButton({ children, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full text-left px-4 py-3 rounded-xl font-bold text-slate-700 hover:bg-white hover:text-indigo-600 transition-colors"
    >
      {children}
    </button>
  );
}

function StatCard({ title, amount, icon, color }) {
  return (
    <div className="glass-card p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-100/50 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110`}></div>
      <div className="flex justify-between items-start relative z-10 mb-4">
        <div className={`p-3 bg-white/80 border border-white rounded-2xl shadow-sm text-${color}-600`}>
          {icon}
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-slate-500 font-semibold text-sm mb-1">{title}</p>
        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          ৳ {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h3>
      </div>
    </div>
  );
}

function EstimateCard({ title, amount }) {
  return (
    <div className="glass-card p-6 rounded-3xl border-l-4 border-l-indigo-400">
      <p className="text-slate-500 font-semibold text-sm mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">
        ৳ {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </h3>
      <p className="text-xs font-medium text-slate-400">Based on current daily average</p>
    </div>
  );
}
