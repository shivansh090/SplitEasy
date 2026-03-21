import { useState } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatRelative } from '../../utils/dateHelpers';
import api from '../../api/axios';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const CATEGORY_DOTS = {
  food: 'bg-amber-400',
  transport: 'bg-sky-400',
  shopping: 'bg-rose-400',
  entertainment: 'bg-violet-400',
  bills: 'bg-slate-400',
  rent: 'bg-red-400',
  groceries: 'bg-emerald-400',
  medical: 'bg-teal-400',
  travel: 'bg-indigo-400',
  general: 'bg-gray-300',
};

const CATEGORIES = ['food', 'transport', 'shopping', 'entertainment', 'bills', 'rent', 'groceries', 'medical', 'travel', 'general'];

export default function RecentExpensesList({ expenses, onUpdate }) {
  const [editingExp, setEditingExp] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  if (!expenses || expenses.length === 0) {
    return <p className="text-center text-gray-400 text-sm py-4">No expenses yet</p>;
  }

  const handleEdit = (exp) => {
    setEditingExp(exp);
    const dateVal = exp.expenseDate || exp.createdAt;
    const localDate = dateVal ? new Date(dateVal).toISOString().slice(0, 16) : '';
    setEditForm({ amount: exp.amount, description: exp.description, category: exp.category, expenseDate: localDate });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/expenses/${editingExp._id}`, editForm);
      setEditingExp(null);
      onUpdate?.();
    } catch (err) {
      console.error('Failed to update:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/expenses/${id}`);
      onUpdate?.();
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="space-y-2">
        {expenses.map((exp) => (
          <div
            key={exp._id}
            className="group flex items-center justify-between px-3 py-2.5 rounded-lg bg-white border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${CATEGORY_DOTS[exp.category] || 'bg-gray-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{exp.description}</p>
                <p className="text-xs text-gray-500">
                  {exp.paidBy?.name || 'You'} &middot; {formatRelative(exp.createdAt)}
                  {exp.isPersonal && (
                    <span className="ml-1 text-primary-600">personal</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">
                {formatCurrency(exp.amount)}
              </span>
              {onUpdate && (
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(exp)}
                    className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                    title="Edit"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(exp._id)}
                    disabled={deletingId === exp._id}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      <Modal isOpen={!!editingExp} onClose={() => setEditingExp(null)} title="Edit Expense">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              value={editForm.amount || ''}
              onChange={(e) => setEditForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={editForm.description || ''}
              onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={editForm.category || 'general'}
              onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
            <input
              type="datetime-local"
              value={editForm.expenseDate || ''}
              onChange={(e) => setEditForm((f) => ({ ...f, expenseDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} loading={saving} className="flex-1">
              Save
            </Button>
            <Button variant="secondary" onClick={() => setEditingExp(null)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
