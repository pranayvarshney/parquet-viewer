import React, { useState } from 'react';
import { X, Filter, Trash2 } from 'lucide-react';
import { ColumnFilter, ParquetDataType } from '../../types/parquet';

interface ColumnFilterModalProps {
  isOpen: boolean;
  column: string;
  type: ParquetDataType;
  currentFilter?: ColumnFilter;
  onApplyFilter: (filter: ColumnFilter | null) => void;
  onClose: () => void;
}

export const ColumnFilterModal: React.FC<ColumnFilterModalProps> = ({
  isOpen,
  column,
  type,
  currentFilter,
  onApplyFilter,
  onClose,
}) => {
  const isNumeric = type === 'int32' || type === 'int64' || type === 'float' || type === 'double' || type === 'decimal';
  
  const [operator, setOperator] = useState<ColumnFilter['operator']>(
    currentFilter?.operator || (isNumeric ? 'gt' : 'contains')
  );
  const [value, setValue] = useState<string>(
    currentFilter?.value !== undefined ? String(currentFilter.value) : ''
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (operator === 'isNull' || operator === 'isNotNull') {
      onApplyFilter({ column, operator, value: '' });
    } else if (value.trim() !== '') {
      const parsedValue = isNumeric ? parseFloat(value) : value.trim();
      onApplyFilter({ column, operator, value: parsedValue });
    } else {
      onApplyFilter(null);
    }
    onClose();
  };

  const handleClear = () => {
    onApplyFilter(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121215] border border-white/[0.12] rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Filter className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm">
              Filter: <span className="font-mono text-indigo-300 font-bold">{column}</span>
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.08]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Condition</label>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value as any)}
              className="w-full bg-[#18181c] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
            >
              {!isNumeric ? (
                <>
                  <option value="contains">Contains substring</option>
                  <option value="equals">Exact match (=)</option>
                  <option value="startsWith">Starts with</option>
                  <option value="endsWith">Ends with</option>
                  <option value="isNull">Is Null / Empty</option>
                  <option value="isNotNull">Is NOT Null</option>
                </>
              ) : (
                <>
                  <option value="equals">Equal to (=)</option>
                  <option value="gt">Greater than (&gt;)</option>
                  <option value="gte">Greater or equal (&gt;=)</option>
                  <option value="lt">Less than (&lt;)</option>
                  <option value="lte">Less or equal (&lt;=)</option>
                  <option value="isNull">Is Null</option>
                  <option value="isNotNull">Is NOT Null</option>
                </>
              )}
            </select>
          </div>

          {operator !== 'isNull' && operator !== 'isNotNull' && (
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Value</label>
              <input
                type={isNumeric ? 'number' : 'text'}
                step={isNumeric ? 'any' : undefined}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={isNumeric ? 'e.g. 100.5' : 'Search value...'}
                autoFocus
                className="w-full bg-[#18181c] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
            {currentFilter ? (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 py-1.5 px-2.5 rounded-xl hover:bg-rose-950/30 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs text-zinc-400 hover:text-zinc-200 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white rounded-xl bg-indigo-600 hover:bg-indigo-500 cursor-pointer shadow-sm shadow-indigo-600/30"
              >
                Apply
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
