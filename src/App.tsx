import { useState, useEffect } from 'react';
import { Home, Receipt, BarChart3, Settings, Plus, X, Camera } from 'lucide-react';

const VittaSakshi = () => {
  const userId = 'teacher_001';
  const groupId = 'personal';

  const categories: Record<string, string> = {
    Bus: '🚌',
    Breakfast: '🥐',
    Lunch: '🍱',
    Dinner: '🍽️',
    Auto: '🚗',
    Train: '🚂',
    Other: '📝'
  };

  const [currentMode, setCurrentMode] = useState('personal');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const result = await window.storage.get(`vitta_expenses_${userId}`);
        if (result && result.value) {
          setExpenses(JSON.parse(result.value));
        }
      } catch (e) {
        console.error('Failed to load expenses', e);
      }
    };
    loadExpenses();
  }, [userId]);

  useEffect(() => {
    const saveExpenses = async () => {
      try {
        await window.storage.set(`vitta_expenses_${userId}`, JSON.stringify(expenses));
      } catch (e) {
        console.error('Failed to save expenses', e);
      }
    };
    saveExpenses();
  }, [expenses, userId]);

  const openAddModal = () => {
    setFormData({ category: '', amount: '', description: '' });
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setFormData({ category: '', amount: '', description: '' });
    setShowAddModal(false);
  };

  const addExpense = (category: string) => {
    setFormData({ ...formData, category });
  };

  const saveExpense = () => {
    if (!formData.category || !formData.amount) return;

    const newExpense = {
      id: `exp_${Date.now()}`,
      userId,
      groupId,
      mode: currentMode,
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: new Date().toISOString(),
      description: formData.description,
      receipt: null
    };

    setExpenses([newExpense, ...expenses]);
    closeAddModal();
  };

  const handleOCRSimulation = () => {
    const mockAmount = (Math.random() * 500 + 50).toFixed(2);
    const foodCategories = ['Breakfast', 'Lunch', 'Dinner'];
    const mockCategory = foodCategories[Math.floor(Math.random() * foodCategories.length)];
    setFormData(prev => ({ ...prev, amount: mockAmount, category: mockCategory }));
  };

  const deleteExpense = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const startEdit = (expense: any) => {
    setEditingId(expense.id);
    setFormData({
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description
    });
    setShowEditModal(true);
  };

  const saveEditedExpense = () => {
    if (!formData.category || !formData.amount) return;

    setExpenses(expenses.map(e =>
      e.id === editingId
        ? { ...e, category: formData.category, amount: parseFloat(formData.amount), description: formData.description }
        : e
    ));

    setFormData({ category: '', amount: '', description: '' });
    setEditingId(null);
    setShowEditModal(false);
  };

  const generatePDF = (mode: string, expensesList: any[], total: number) => {
    const fileName = `${mode.charAt(0).toUpperCase() + mode.slice(1)}_Expenses_${new Date().toLocaleDateString()}.pdf`;

    let csvContent = 'Date,Category,Description,Amount\n';
    expensesList.forEach(exp => {
      csvContent += `${new Date(exp.date).toLocaleDateString()},"${exp.category}","${exp.description || ''}",${exp.amount.toFixed(2)}\n`;
    });
    csvContent += `\nTotal,,,${total.toFixed(2)}\n`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${fileName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #1e293b; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 5px 0; color: #64748b; }
          .summary { background-color: ${mode === 'work' ? '#dcfce7' : '#dbeafe'}; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 2px solid ${mode === 'work' ? '#22c55e' : '#3b82f6'}; }
          .summary p { margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #f1f5f9; padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1; font-weight: bold; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .total-row { background-color: #f1f5f9; border-top: 2px solid #cbd5e1; font-weight: bold; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #cbd5e1; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Vitta-Sakshi</h1>
          <p>${mode === 'work' ? 'Work Reimbursement Report' : 'Personal Expenses Report'}</p>
        </div>
        
        <div class="summary">
          <p><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Mode:</strong> ${mode.charAt(0).toUpperCase() + mode.slice(1)}</p>
          <p><strong>Total Amount:</strong> ₹${total.toFixed(2)}</p>
          <p><strong>Transaction Count:</strong> ${expensesList.length}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${expensesList.map((exp) => `
              <tr>
                <td>${new Date(exp.date).toLocaleDateString()}</td>
                <td>${exp.category}</td>
                <td>${exp.description || '-'}</td>
                <td>₹${exp.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="3">Total</td>
              <td>₹${total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <p>Generated by Vitta-Sakshi on ${new Date().toLocaleString()}</p>
          <p>This is an automated report for ${mode === 'work' ? 'school reimbursement' : 'personal record'}.</p>
        </div>
      </body>
      </html>
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent));
    element.setAttribute('download', fileName.replace('.pdf', '.html'));
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    const csvElement = document.createElement('a');
    csvElement.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    csvElement.setAttribute('download', fileName.replace('.pdf', '.csv'));
    csvElement.style.display = 'none';
    document.body.appendChild(csvElement);
    csvElement.click();
    document.body.removeChild(csvElement);
  };

  const filteredExpenses = expenses.filter(e => e.mode === currentMode);

  const workTotal = expenses.filter(e => e.mode === 'work').reduce((sum, e) => sum + e.amount, 0);
  const personalTotal = expenses.filter(e => e.mode === 'personal').reduce((sum, e) => sum + e.amount, 0);
  const monthlyTotal = workTotal + personalTotal;
  const workPercentage = monthlyTotal > 0 ? (workTotal / monthlyTotal) * 100 : 0;

  const fmt = (num: number) => `₹${num.toFixed(2)}`;

  return (
    <div className="w-full max-w-md mx-auto bg-white min-h-screen flex flex-col pb-20">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4">
        <h1 className="text-center text-xl font-bold">Vitta-Sakshi</h1>
        <p className="text-center text-xs text-slate-300">The Wealth Witness</p>
      </div>

      <div className="flex justify-center gap-2 p-4 bg-slate-50 border-b border-slate-200">
        <button
          onClick={() => setCurrentMode('personal')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${currentMode === 'personal'
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-white text-slate-600 border border-slate-300'
            }`}
        >
          Home Personal
        </button>
        <button
          onClick={() => setCurrentMode('work')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${currentMode === 'work'
            ? 'bg-green-600 text-white shadow-md'
            : 'bg-white text-slate-600 border border-slate-300'
            }`}
        >
          Work Mode
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'home' && (
          <div className="p-4 space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <p className="text-xs uppercase text-slate-600 font-semibold">Total This Month</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-1">{fmt(monthlyTotal)}</h2>
              <p className="text-xs text-slate-500 mt-2">
                Work: {fmt(workTotal)} | Personal: {fmt(personalTotal)}
              </p>

              <div className="mt-4 bg-slate-300 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-600 h-full transition-all duration-300"
                  style={{ width: `${workPercentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 mt-2 text-center">
                {workPercentage.toFixed(0)}% Work | {(100 - workPercentage).toFixed(0)}% Personal
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-xs text-slate-600">Work This Month</p>
                <p className="text-xl font-bold text-green-700 mt-1">{fmt(workTotal)}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-xs text-slate-600">Personal This Month</p>
                <p className="text-xl font-bold text-blue-700 mt-1">{fmt(personalTotal)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Recent Expenses</h3>
              {filteredExpenses.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No expenses yet. Add one to get started!</p>
              ) : (
                <div className="space-y-2">
                  {filteredExpenses.slice(0, 5).map(exp => (
                    <div key={exp.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{categories[exp.category] || '📝'}</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{exp.category}</p>
                          <p className="text-xs text-slate-500">{new Date(exp.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className="font-bold text-slate-900">{fmt(exp.amount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="p-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">All Expenses</h2>
            {filteredExpenses.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No expenses in this category.</p>
            ) : (
              <div className="space-y-2">
                {filteredExpenses.map(exp => (
                  <div key={exp.id} className="flex justify-between items-center bg-white border border-slate-200 p-3 rounded-lg group hover:bg-slate-50 transition">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-lg">{categories[exp.category] || '📝'}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{exp.category}</p>
                        <p className="text-xs text-slate-500">{new Date(exp.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-slate-900 min-w-16 text-right">{fmt(exp.amount)}</p>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(exp)}
                          className="px-2 py-1 bg-blue-500 text-white text-xs rounded font-semibold hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="px-2 py-1 bg-red-500 text-white text-xs rounded font-semibold hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="p-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Expense Reports</h2>
            <div className={`border rounded-lg p-6 ${currentMode === 'work' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                {currentMode === 'work' ? 'Work Reimbursement Summary' : 'Personal Expenses Summary'}
              </h3>
              <p className={`text-2xl font-bold ${currentMode === 'work' ? 'text-green-700' : 'text-blue-700'}`}>
                {fmt(currentMode === 'work' ? workTotal : personalTotal)}
              </p>
              <p className="text-xs text-slate-600 mt-2">{filteredExpenses.length} transactions this month</p>

              {filteredExpenses.length > 0 && (
                <div className="mt-4 bg-white rounded-lg p-3 max-h-48 overflow-y-auto border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Transactions:</p>
                  {filteredExpenses.map(exp => (
                    <div key={exp.id} className="flex justify-between text-xs text-slate-700 mb-2 pb-2 border-b border-slate-100">
                      <span>{exp.category} - {new Date(exp.date).toLocaleDateString()}</span>
                      <span className="font-semibold">{fmt(exp.amount)}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => generatePDF(currentMode, filteredExpenses, currentMode === 'work' ? workTotal : personalTotal)}
                className={`mt-4 w-full text-white py-2 rounded-lg font-semibold text-sm ${currentMode === 'work' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                Generate Report (HTML/CSV)
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Settings</h2>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-600 mb-2">User ID: {userId}</p>
              <p className="text-sm text-slate-600 mb-3">Group ID: {groupId}</p>
              <button
                onClick={() => {
                  if (window.confirm('Clear all expenses?')) {
                    setExpenses([]);
                    window.storage.delete(`vitta_expenses_${userId}`);
                  }
                }}
                className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold text-sm"
              >
                Clear All Data
              </button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-2xl p-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Add Expense</h2>
              <button onClick={closeAddModal} className="p-1 hover:bg-slate-100 rounded">
                <X size={20} />
              </button>
            </div>

            {!formData.category ? (
              <div>
                <p className="text-xs uppercase font-semibold text-slate-600 mb-3">Quick Select</p>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {Object.entries(categories).map(([cat, emoji]) => (
                    <button
                      key={cat}
                      onClick={() => addExpense(cat)}
                      className="aspect-square bg-slate-100 hover:bg-slate-200 rounded-lg flex flex-col items-center justify-center text-center text-xs font-semibold transition-all"
                    >
                      <span className="text-xl mb-1">{emoji}</span>
                      <span className="text-xs">{cat}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Category</label>
                  <div className="mt-1 bg-slate-100 p-3 rounded-lg text-sm font-semibold flex items-center gap-2">
                    <span className="text-lg">{categories[formData.category]}</span>
                    {formData.category}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Notes..."
                    className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleOCRSimulation}
                  className="w-full flex items-center justify-center gap-2 bg-slate-200 text-slate-700 py-2 rounded-lg font-semibold text-sm hover:bg-slate-300 transition"
                >
                  <Camera size={16} /> Scan Receipt
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormData({ category: '', amount: '', description: '' })}
                    className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg font-semibold text-sm"
                  >
                    Back
                  </button>
                  <button
                    onClick={saveExpense}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-700"
                  >
                    Save Expense
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-2xl p-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Edit Expense</h2>
              <button onClick={() => { setShowEditModal(false); setEditingId(null); setFormData({ category: '', amount: '', description: '' }); }} className="p-1 hover:bg-slate-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {Object.keys(categories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Notes..."
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowEditModal(false); setEditingId(null); setFormData({ category: '', amount: '', description: '' }); }}
                  className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedExpense}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around max-w-md mx-auto">
        {[
          { id: 'home', icon: Home, label: 'Home' },
          { id: 'expenses', icon: Receipt, label: 'Expenses' },
          { id: 'reports', icon: BarChart3, label: 'Reports' },
          { id: 'settings', icon: Settings, label: 'Settings' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 text-xs font-semibold transition-colors ${activeTab === tab.id
              ? 'text-blue-600 bg-blue-50'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
        <button
          onClick={openAddModal}
          className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};

export default VittaSakshi;
