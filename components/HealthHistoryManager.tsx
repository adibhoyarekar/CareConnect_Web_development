import React, { useState } from 'react';
import { HealthHistoryItem } from '../types';

interface HealthHistoryManagerProps {
  healthHistory: HealthHistoryItem[];
  onHistoryChange: (newHistory: HealthHistoryItem[]) => void;
  isEditing: boolean;
}

const simpleId = () => `id_${Math.random().toString(36).substr(2, 9)}`;

const HealthHistoryManager: React.FC<HealthHistoryManagerProps> = ({ healthHistory = [], onHistoryChange, isEditing }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    type: 'condition' as 'condition' | 'illness' | 'surgery',
    name: '',
    date: '',
    notes: ''
  });

  const inputBaseClasses = "block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500 py-2 px-3";

  const handleAddItem = () => {
    if (!newItem.name || !newItem.date) return;
    const itemToAdd: HealthHistoryItem = {
      id: simpleId(),
      ...newItem,
    };
    onHistoryChange([...healthHistory, itemToAdd]);
    setNewItem({ type: 'condition', name: '', date: '', notes: '' });
    setIsAdding(false);
  };

  const handleRemoveItem = (id: string) => {
    onHistoryChange(healthHistory.filter(item => item.id !== id));
  };
  
  const typeStyles = {
    condition: { icon: '❤️', color: 'bg-blue-100 text-blue-800' },
    illness: { icon: '🤒', color: 'bg-yellow-100 text-yellow-800' },
    surgery: { icon: '🔪', color: 'bg-red-100 text-red-800' },
  };

  return (
    <div className="space-y-4">
       <div className="flex justify-between items-center">
         <h3 className="text-xl font-semibold text-gray-900">Health History</h3>
         {isEditing && !isAdding && (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              + Add Item
            </button>
          )}
       </div>

      {isEditing && isAdding && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as any})} className={inputBaseClasses}>
                <option value="condition">Condition</option>
                <option value="illness">Illness</option>
                <option value="surgery">Surgery</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name / Title</label>
              <input type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="e.g., Asthma" className={inputBaseClasses} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date / Year</label>
              <input type="text" value={newItem.date} onChange={e => setNewItem({...newItem, date: e.target.value})} placeholder="e.g., 2015 or Ongoing" className={inputBaseClasses} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea value={newItem.notes} onChange={e => setNewItem({...newItem, notes: e.target.value})} rows={2} className={inputBaseClasses}></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setIsAdding(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="button" onClick={handleAddItem} className="bg-primary-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-primary-700">Save Item</button>
          </div>
        </div>
      )}

      {(healthHistory && healthHistory.length > 0) ? (
        <ul className="space-y-3">
          {healthHistory.map(item => (
            <li key={item.id} className="p-4 bg-white rounded-lg border border-gray-200 flex items-start space-x-4">
              <span className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${typeStyles[item.type].color}`}>{typeStyles[item.type].icon}</span>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.date}</p>
                  </div>
                  {isEditing && (
                    <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                  )}
                </div>
                {item.notes && <p className="text-sm text-gray-600 mt-1">{item.notes}</p>}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-center py-4">No health history recorded.</p>
      )}
    </div>
  );
};

export default HealthHistoryManager;