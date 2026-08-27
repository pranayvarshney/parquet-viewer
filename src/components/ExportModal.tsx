import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileSpreadsheet,
  Code2,
  Database,
  FileText,
} from 'lucide-react';
import { ParquetDataFile } from '../types/parquet';
import { exportDataToString, generateCodeSnippets, ExportFormat } from '../services/exporter';

interface ExportModalProps {
  isOpen: boolean;
  file: ParquetDataFile;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, file, onClose }) => {
  const [activeTab, setActiveTab] = useState<'export' | 'code'>('export');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [selectedSnippetLang, setSelectedSnippetLang] = useState<string>('python_pandas');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const snippets = generateCodeSnippets(file);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const content = exportDataToString(file.rows, file.columns, selectedFormat);
      const defaultName = `${file.name.replace(/\.parquet$/i, '')}.${selectedFormat}`;

      if ((window as any).electron?.saveExport) {
        await (window as any).electron.saveExport({
          defaultName,
          content,
          format: selectedFormat,
        });
      } else {
        const mimeTypes: Record<string, string> = {
          csv: 'text/csv;charset=utf-8;',
          tsv: 'text/tab-separated-values;charset=utf-8;',
          json: 'application/json;charset=utf-8;',
          ndjson: 'application/x-ndjson;charset=utf-8;',
        };

        const blob = new Blob([content], { type: mimeTypes[selectedFormat] });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = defaultName;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  const handleCopySnippet = () => {
    const code = snippets[selectedSnippetLang] || '';
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121215] border border-white/[0.12] rounded-3xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-white/[0.08] bg-[#16161a]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm">Export & Code Generator</h3>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-[#0c0c0e] p-0.5 rounded-xl border border-white/[0.08] text-xs">
              <button
                onClick={() => setActiveTab('export')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'export' ? 'bg-[#22222a] text-emerald-400 font-medium' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'code' ? 'bg-[#22222a] text-indigo-400 font-medium' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab 1: Export Format */}
        {activeTab === 'export' && (
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                Select Export Format
              </label>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'csv', name: 'CSV', desc: 'Standard comma-separated table', icon: FileSpreadsheet },
                  { id: 'json', name: 'JSON', desc: 'Array of formatted objects', icon: Code2 },
                  { id: 'ndjson', name: 'NDJSON / JSONL', desc: 'Newline-delimited JSON streams', icon: FileText },
                  { id: 'tsv', name: 'TSV', desc: 'Tab-separated values', icon: FileSpreadsheet },
                ].map((fmt) => {
                  const Icon = fmt.icon;
                  const isSelected = selectedFormat === fmt.id;
                  return (
                    <div
                      key={fmt.id}
                      onClick={() => setSelectedFormat(fmt.id as ExportFormat)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                        isSelected
                          ? 'border-emerald-500/80 bg-emerald-500/10 shadow-lg shadow-emerald-950/40'
                          : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.06] text-zinc-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{fmt.name}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{fmt.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0c0c0e] border border-white/[0.06] text-xs text-zinc-400 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Total records:</span>
                <span className="text-white font-bold">{file.rows.length.toLocaleString()} rows</span>
              </div>
              <div className="flex justify-between">
                <span>Columns:</span>
                <span className="text-white font-bold">{file.columns.length} columns</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-xl bg-white/[0.06] hover:bg-white/[0.1] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={isExporting}
                className="flex items-center space-x-2 px-5 py-2 text-xs font-semibold text-white rounded-xl bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {selectedFormat.toUpperCase()}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Code Snippets */}
        {activeTab === 'code' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
                {[
                  { id: 'python_pandas', label: 'Pandas' },
                  { id: 'python_polars', label: 'Polars' },
                  { id: 'python_duckdb', label: 'DuckDB' },
                  { id: 'python_pyarrow', label: 'PyArrow' },
                  { id: 'nodejs_duckdb', label: 'Node.js' },
                  { id: 'sql_cli', label: 'CLI' },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedSnippetLang(lang.id)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                      selectedSnippetLang === lang.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white/[0.05] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopySnippet}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-[#0c0c0e] border border-white/[0.08] text-indigo-300 font-mono text-xs overflow-x-auto selection:bg-indigo-500/30">
              {snippets[selectedSnippetLang]}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
