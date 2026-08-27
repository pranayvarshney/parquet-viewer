import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Columns,
  Pin,
  Eye,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
} from 'lucide-react';
import { ParquetDataFile, SortConfig, ColumnFilter, ParquetDataType } from '../../types/parquet';
import { CellRenderer } from './CellRenderer';
import { NestedInspectorModal } from './NestedInspectorModal';
import { ColumnFilterModal } from './ColumnFilterModal';

interface DataGridProps {
  file: ParquetDataFile;
}

export const DataGrid: React.FC<DataGridProps> = ({ file }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, ColumnFilter>>({});
  const [pinnedColumns, setPinnedColumns] = useState<string[]>([]);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  
  // Pagination State
  const [pageSize, setPageSize] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Column Filter Modal State
  const [filterModalCol, setFilterModalCol] = useState<string | null>(null);

  // Nested Inspector Modal State
  const [nestedData, setNestedData] = useState<{ open: boolean; title: string; data: any }>({
    open: false,
    title: '',
    data: null,
  });

  // Cell / Row copy feedback
  const [copiedRowIdx, setCopiedRowIdx] = useState<number | null>(null);
  const [showColSelector, setShowColSelector] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Cmd+F for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered & Sorted Rows
  const processedRows = useMemo(() => {
    let result = file.rows;

    // 1. Global Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((row) => {
        for (const col of file.columns) {
          const val = row[col];
          if (val === null || val === undefined) continue;
          if (typeof val === 'object') {
            if (JSON.stringify(val).toLowerCase().includes(q)) return true;
          } else if (String(val).toLowerCase().includes(q)) {
            return true;
          }
        }
        return false;
      });
    }

    // 2. Column-specific filters
    const filterEntries = Object.values(columnFilters);
    if (filterEntries.length > 0) {
      result = result.filter((row) => {
        return filterEntries.every((f) => {
          const val = row[f.column];
          if (f.operator === 'isNull') return val === null || val === undefined;
          if (f.operator === 'isNotNull') return val !== null && val !== undefined;
          if (val === null || val === undefined) return false;

          switch (f.operator) {
            case 'contains':
              return String(val).toLowerCase().includes(String(f.value).toLowerCase());
            case 'equals':
              return String(val).toLowerCase() === String(f.value).toLowerCase();
            case 'startsWith':
              return String(val).toLowerCase().startsWith(String(f.value).toLowerCase());
            case 'endsWith':
              return String(val).toLowerCase().endsWith(String(f.value).toLowerCase());
            case 'gt':
              return Number(val) > Number(f.value);
            case 'gte':
              return Number(val) >= Number(f.value);
            case 'lt':
              return Number(val) < Number(f.value);
            case 'lte':
              return Number(val) <= Number(f.value);
            default:
              return true;
          }
        });
      });
    }

    // 3. Sorting
    if (sortConfig) {
      const { column, direction } = sortConfig;
      const dir = direction === 'asc' ? 1 : -1;

      result = [...result].sort((a, b) => {
        const valA = a[column];
        const valB = b[column];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1 * dir;
        if (valB === null || valB === undefined) return -1 * dir;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * dir;
        }
        if (valA instanceof Date && valB instanceof Date) {
          return (valA.getTime() - valB.getTime()) * dir;
        }
        return String(valA).localeCompare(String(valB)) * dir;
      });
    }

    return result;
  }, [file.rows, file.columns, searchQuery, columnFilters, sortConfig]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(processedRows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return processedRows.slice(start, start + pageSize);
  }, [processedRows, safeCurrentPage, pageSize]);

  // Visible columns ordered by pinned first
  const visibleColumns = useMemo(() => {
    const active = file.columns.filter((c) => !hiddenColumns.includes(c));
    const pinned = active.filter((c) => pinnedColumns.includes(c));
    const unpinned = active.filter((c) => !pinnedColumns.includes(c));
    return [...pinned, ...unpinned];
  }, [file.columns, hiddenColumns, pinnedColumns]);

  const handleSort = (column: string) => {
    if (sortConfig?.column === column) {
      if (sortConfig.direction === 'asc') {
        setSortConfig({ column, direction: 'desc' });
      } else {
        setSortConfig(null);
      }
    } else {
      setSortConfig({ column, direction: 'asc' });
    }
  };

  const togglePin = (column: string) => {
    setPinnedColumns((prev) =>
      prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]
    );
  };

  const handleCopyRow = (row: Record<string, any>, idx: number) => {
    const cleanRow = { ...row };
    delete cleanRow._rowIndex;
    navigator.clipboard.writeText(JSON.stringify(cleanRow, null, 2));
    setCopiedRowIdx(idx);
    setTimeout(() => setCopiedRowIdx(null), 1500);
  };

  const activeFiltersCount = Object.keys(columnFilters).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0c0c0e] select-none overflow-hidden">
      {/* Table Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#141417] border-b border-white/[0.08] gap-3">
        {/* Left: Global Search */}
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search across all columns (⌘F)..."
              className="w-full bg-[#1c1c22] border border-white/[0.08] focus:border-indigo-500 rounded-xl pl-9 pr-8 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-zinc-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={() => setColumnFilters({})}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 text-xs font-medium hover:bg-indigo-500/25 transition-colors whitespace-nowrap cursor-pointer"
              title="Clear all column filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}</span>
            </button>
          )}
        </div>

        {/* Right: Columns Selector & Page Controls */}
        <div className="flex items-center space-x-3">
          {/* Column Visibility Menu */}
          <div className="relative">
            <button
              onClick={() => setShowColSelector(!showColSelector)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-zinc-300 text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer"
            >
              <Columns className="w-3.5 h-3.5 text-zinc-400" />
              <span>Columns</span>
              <span className="text-[10px] text-zinc-400 font-mono bg-white/[0.06] px-1.5 py-0.2 rounded-md">
                {visibleColumns.length}/{file.columns.length}
              </span>
            </button>

            {showColSelector && (
              <div className="absolute right-0 mt-2 w-56 bg-[#18181c] border border-white/[0.12] rounded-2xl shadow-2xl p-2.5 z-40 max-h-72 overflow-y-auto backdrop-blur-xl">
                <div className="text-[11px] font-semibold text-zinc-400 px-2 py-1 uppercase tracking-wider">
                  Toggle Columns
                </div>
                <div className="space-y-1 mt-1">
                  {file.columns.map((col) => {
                    const isVisible = !hiddenColumns.includes(col);
                    return (
                      <label
                        key={col}
                        className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.06] text-xs text-zinc-200 cursor-pointer font-mono"
                      >
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setHiddenColumns((prev) => prev.filter((c) => c !== col));
                            } else {
                              setHiddenColumns((prev) => [...prev, col]);
                            }
                          }}
                          className="rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-0"
                        />
                        <span className="truncate">{col}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Rows per page selector */}
          <div className="flex items-center space-x-1.5 text-xs text-zinc-400">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#1c1c22] border border-white/[0.08] rounded-xl px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
              <option value={1000}>1,000</option>
            </select>
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center space-x-1 bg-[#18181c] rounded-xl border border-white/[0.08] p-0.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage <= 1}
              className="p-1.2 rounded-lg text-zinc-400 hover:text-white disabled:opacity-25 cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="p-1.2 rounded-lg text-zinc-400 hover:text-white disabled:opacity-25 cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="text-xs font-mono text-zinc-300 px-2 font-medium">
              {safeCurrentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="p-1.2 rounded-lg text-zinc-400 hover:text-white disabled:opacity-25 cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage >= totalPages}
              className="p-1.2 rounded-lg text-zinc-400 hover:text-white disabled:opacity-25 cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="flex-1 overflow-auto relative">
        <table className="w-full text-left border-collapse min-w-max">
          {/* Table Header */}
          <thead className="sticky top-0 z-20 bg-[#141417] border-b border-white/[0.08] shadow-sm">
            <tr>
              {/* Row Index Column */}
              <th className="w-12 px-3.5 py-2.5 text-[11px] font-mono text-zinc-500 bg-[#141417] sticky left-0 z-30 border-r border-white/[0.06] text-center">
                #
              </th>

              {visibleColumns.map((col) => {
                const type = file.columnTypes[col] || 'string';
                const isPinned = pinnedColumns.includes(col);
                const hasFilter = Boolean(columnFilters[col]);
                const isSorted = sortConfig?.column === col;

                return (
                  <th
                    key={col}
                    className={`px-3.5 py-2.5 text-xs font-semibold tracking-wider text-zinc-300 border-r border-white/[0.06] select-none group/th hover:bg-white/[0.03] transition-colors ${
                      isPinned ? 'sticky bg-[#141417] z-20 shadow-r' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between space-x-2">
                      {/* Column Title & Sort Button */}
                      <div
                        onClick={() => handleSort(col)}
                        className="flex items-center space-x-1.5 cursor-pointer flex-1 truncate"
                        title={`Sort by ${col}`}
                      >
                        <span className="font-mono text-zinc-100 truncate font-semibold">{col}</span>
                        <span className="text-[10px] font-mono text-zinc-500 font-normal">
                          {type}
                        </span>

                        {isSorted ? (
                          sortConfig.direction === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-indigo-400" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-600 opacity-0 group-hover/th:opacity-100 transition-opacity" />
                        )}
                      </div>

                      {/* Header Actions: Filter & Pin */}
                      <div className="flex items-center space-x-0.5 opacity-0 group-hover/th:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilterModalCol(col);
                          }}
                          className={`p-1 rounded-md hover:bg-white/[0.1] transition-colors cursor-pointer ${
                            hasFilter ? 'opacity-100 text-indigo-400' : 'text-zinc-400'
                          }`}
                          title={`Filter ${col}`}
                        >
                          <Filter className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePin(col);
                          }}
                          className={`p-1 rounded-md hover:bg-white/[0.1] transition-colors cursor-pointer ${
                            isPinned ? 'opacity-100 text-amber-400' : 'text-zinc-400'
                          }`}
                          title={isPinned ? 'Unpin column' : 'Pin column to left'}
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-white/[0.04] font-mono text-xs">
            {paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + 1}
                  className="py-16 text-center text-zinc-500 font-sans text-sm"
                >
                  No matching rows found.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, rIdx) => {
                const globalRowIdx = (safeCurrentPage - 1) * pageSize + rIdx + 1;
                const isCopied = copiedRowIdx === rIdx;

                return (
                  <tr
                    key={row._rowIndex ?? rIdx}
                    className="hover:bg-white/[0.03] group/row transition-colors"
                  >
                    {/* Row Index with Quick Copy Row Button */}
                    <td className="px-3.5 py-2 text-[11px] text-zinc-500 bg-[#0c0c0e] group-hover/row:bg-[#141417] sticky left-0 z-10 border-r border-white/[0.06] text-center relative font-mono">
                      <span className="group-hover/row:hidden">{globalRowIdx}</span>
                      <button
                        onClick={() => handleCopyRow(row, rIdx)}
                        className="hidden group-hover/row:flex items-center justify-center w-full h-full text-zinc-400 hover:text-indigo-400 cursor-pointer"
                        title="Copy row as JSON"
                      >
                        {isCopied ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </td>

                    {/* Data Cells */}
                    {visibleColumns.map((col) => {
                      const val = row[col];
                      const type = file.columnTypes[col];
                      const isPinned = pinnedColumns.includes(col);

                      return (
                        <td
                          key={col}
                          onDoubleClick={() =>
                            setNestedData({ open: true, title: `${col} (Row #${globalRowIdx})`, data: val })
                          }
                          className={`px-3.5 py-2 border-r border-white/[0.04] max-w-xs grid-cell ${
                            isPinned ? 'sticky bg-[#0c0c0e] group-hover/row:bg-[#141417] z-10' : ''
                          }`}
                        >
                          <CellRenderer
                            value={val}
                            type={type}
                            columnName={col}
                            onInspectNested={(data, title) =>
                              setNestedData({ open: true, title, data })
                            }
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Column Filter Modal */}
      {filterModalCol && (
        <ColumnFilterModal
          isOpen={Boolean(filterModalCol)}
          column={filterModalCol}
          type={file.columnTypes[filterModalCol] || 'string'}
          currentFilter={columnFilters[filterModalCol]}
          onApplyFilter={(filter) => {
            setColumnFilters((prev) => {
              const next = { ...prev };
              if (filter) {
                next[filterModalCol] = filter;
              } else {
                delete next[filterModalCol];
              }
              return next;
            });
            setCurrentPage(1);
          }}
          onClose={() => setFilterModalCol(null)}
        />
      )}

      {/* Nested Struct / JSON Inspector Modal */}
      <NestedInspectorModal
        isOpen={nestedData.open}
        title={nestedData.title}
        data={nestedData.data}
        onClose={() => setNestedData({ open: false, title: '', data: null })}
      />
    </div>
  );
};
