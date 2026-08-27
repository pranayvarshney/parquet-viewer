# 🔍 Parquet Viewer — Fast, Free Desktop Parquet File Reader & SQL GUI

<div align="center">

**The fastest, 100% local-first macOS desktop application to inspect, query with SQL, profile, and export Apache Parquet (`.parquet`) files — without writing a single line of Python.**

[![GitHub Release](https://img.shields.io/github/v/release/pranayvarshney/parquet-viewer?color=indigo&label=Release)](https://github.com/pranayvarshney/parquet-viewer/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-macOS%20(Apple%20Silicon%20%26%20Intel)-indigo.svg)]()
[![Electron](https://img.shields.io/badge/Electron-34.x-blue.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg)](https://www.typescriptlang.org/)
[![Zero Python Required](https://img.shields.io/badge/Dependencies-Zero%20Python%20%2F%20JVM-purple.svg)]()
[![Offline First](https://img.shields.io/badge/Privacy-100%25%20Offline%20First-success.svg)]()

<br/>

[⬇️ Download DMG](#-instant-download--installation) • [✨ Key Features](#-key-features) • [⚡ Feature Comparison](#-feature-comparison) • [⌨️ Shortcuts](#-keyboard-shortcuts) • [❓ FAQ](#-frequently-asked-questions-faq) • [🛠️ Build from Source](#-build-from-source)

</div>

---

## 🚀 Quick Download

| Platform | Installer | Architecture |
| :--- | :--- | :--- |
| **macOS (Apple Silicon & Intel)** | [**Download `ParquetViewer.dmg`**](https://github.com/pranayvarshney/parquet-viewer/releases/latest) | `arm64` / `x64` |

---

## 💡 What is Parquet Viewer?

**Parquet Viewer** is a standalone, open-source desktop GUI designed for data engineers, data scientists, ML practitioners, and analytics developers who need to instantly view, inspect, search, and query Apache Parquet (`.parquet`, `.pq`) files.

Instead of writing boilerplate Python scripts (`pandas.read_parquet`), launching heavy Jupyter Notebooks, or uploading sensitive enterprise data to untrusted web tools, **Parquet Viewer** runs locally on your machine with near-instant startup times and zero configuration.

---

## ✨ Key Features

### ⚡ 1. 100% Local-First & Privacy-Focused
- **No Cloud Uploads**: Your data never leaves your machine. Perfect for HIPAA, SOC2, financial, and confidential datasets.
- **Pure JavaScript/TypeScript Parser**: Powered by [`hyparquet`](https://github.com/hyparam/hyparquet) with full support for:
  - **Compressions**: `Snappy`, `ZSTD`, `GZIP`, `Brotli`, `LZ4`, and `UNCOMPRESSED`.
  - **Data Types**: Strings, Booleans, Integers (`INT32`, `INT64`), Decimals, Floats/Doubles, Dates, Spark `INT96` Timestamps, UUIDs, Binary, Nested Structs, and Lists.

### 📊 2. High-Performance Virtualized Table Grid
- Browse 100,000+ rows smoothly with virtualized scrolling and page controls.
- **Type-Aware Visual Badges**: Color-coded badges for booleans, dates, timestamps, and nested objects.
- **Advanced Filtering & Sorting**: Filter by `= exact`, `!= not equal`, `>`, `<`, `contains substring`, `starts with`, `ends with`, and `is null / is not null`.
- **Column Pinning & Freezing**: Pin essential identifier columns while scrolling wide datasets.
- **Multi-File Workspace**: Open multiple Parquet files simultaneously in separate workspace tabs.

### 🔍 3. Deep Cell Detail Inspector
- **Expand Large Cells**: Double-click any cell or hover and click <kbd>⤢</kbd> to inspect large cell payloads (50KB+ strings, trajectories, agent traces, logs).
- **Interactive JSON Tree**: Expand and collapse deeply nested structs, maps, and list hierarchies.
- **Sub-Table View**: Automatically formats arrays of objects as clean, sortable sub-tables.
- **In-Cell Search & Word Wrap**: Search keywords directly inside large text cells and toggle word wrap.
- **1-Click Copy**: Copy raw formatted JSON or strings to clipboard instantly.

### 💻 4. Embedded In-Memory SQL Console
- Run standard SQL queries directly against your loaded dataset:
  ```sql
  SELECT category, COUNT(*) AS count, AVG(total_amount) AS avg_sales 
  FROM parquet 
  GROUP BY category 
  ORDER BY avg_sales DESC 
  LIMIT 50;
  ```
- **Query Templates**: 1-click starter queries for quick aggregations, group-bys, and filtering.
- **Execution Timing**: Sub-millisecond timing indicators and direct CSV export for query results.

### 📈 5. Column Profiler & Statistical Analytics
- Statistical summaries for every column at a glance:
  - **Numeric metrics**: Min, Max, Mean (Average), Standard Deviation ($\sigma$).
  - **Categorical metrics**: Unique value counts, missing/null ratio, frequency distributions.
  - **Histograms**: Visual value distribution charts.

### 🧬 6. Schema & Row Group Explorer
- Inspect Parquet schema trees, logical types, physical encodings, and repetition levels (`REQUIRED`, `OPTIONAL`, `REPEATED`).
- **Row Group Inspector**: Uncompressed vs compressed byte sizes, compression ratios, and chunk offsets.
- **Metadata Viewer**: Inspect embedded key-value metadata (e.g. Pandas versions, Spark schemas, creator engines).

### 📤 7. Multi-Format Exporter & Polyglot Code Generator
- Export full or filtered datasets to **CSV**, **TSV**, **JSON**, and **NDJSON / JSONL** (preserving nested arrays and structs as native JSON values).
- Generate copy-pasteable code snippets for:
  - 🐍 **Python Pandas** (`pd.read_parquet`)
  - ⚡ **Python Polars** (`pl.read_parquet`)
  - 🦆 **DuckDB** (Python, Node.js & CLI)
  - 🏹 **Apache PyArrow** (`pq.read_table`)

---

## ⚡ Feature Comparison

| Feature | 🔍 Parquet Viewer | 📓 Jupyter / Python | 🦆 DuckDB CLI | 🌐 Online Web Viewers |
| :--- | :---: | :---: | :---: | :---: |
| **Startup Time** | **Instant (< 1s)** | Slow (5–15s) | Fast | Slow (Upload dependent) |
| **Zero Python/JVM Setup** | ✅ **Yes** | ❌ No | ❌ Requires CLI binary | ❌ Requires Internet |
| **100% Offline & Private** | ✅ **Yes** | ✅ Yes | ✅ Yes | ❌ Data leaves machine |
| **Visual Table Grid & Search** | ✅ **Yes** | ⚠️ Basic Pandas HTML | ❌ Terminal text only | ⚠️ Basic |
| **Deep Nested Struct Tree** | ✅ **Yes** | ❌ Text dump | ❌ Text dump | ❌ Truncated |
| **In-Memory SQL Console** | ✅ **Yes** | ⚠️ Needs DuckDB setup | ✅ Yes | ❌ No |
| **Column Histograms & Stats** | ✅ **Yes** | ⚠️ Needs Matplotlib / Seaborn | ❌ Manual SQL | ❌ No |
| **1-Click Multi-Format Export** | ✅ **CSV, JSON, NDJSON, TSV** | ⚠️ Code needed | ⚠️ Code needed | ⚠️ Limited |

---

## 📥 Instant Download & Installation

### macOS (Apple Silicon & Intel)

1. Download **[`ParquetViewer.dmg`](https://github.com/pranayvarshney/parquet-viewer/releases/latest)** from the latest release.
2. Double-click the DMG and **drag `ParquetViewer` into your `Applications` folder**.
3. *Note for unsigned open-source binaries*: If macOS displays a standard security prompt on first launch, run this one-time command in your Terminal:
   ```bash
   xattr -cr /Applications/ParquetViewer.app
   ```
4. Launch **Parquet Viewer** from Spotlight (<kbd>⌘</kbd> + <kbd>Space</kbd>) or Applications!

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>⌘</kbd> + <kbd>O</kbd> | Open Parquet File(s) from disk |
| <kbd>⌘</kbd> + <kbd>W</kbd> | Close active file tab |
| <kbd>⌘</kbd> + <kbd>1</kbd> | Switch to **Grid View** |
| <kbd>⌘</kbd> + <kbd>2</kbd> | Switch to **Schema Inspector** |
| <kbd>⌘</kbd> + <kbd>3</kbd> | Switch to **SQL Console** |
| <kbd>⌘</kbd> + <kbd>4</kbd> | Switch to **Analytics Profiler** |
| <kbd>⌘</kbd> + <kbd>Enter</kbd> | Execute SQL query in SQL Console |
| **Double Click Cell** | Open Cell Detail Inspector (JSON Tree / Table / Text) |

---

## ❓ Frequently Asked Questions (FAQ)

### Q: How do I open a `.parquet` file on Mac without Python?
**A:** Simply install **Parquet Viewer**, launch the app, and drag and drop your `.parquet` or `.pq` file directly into the window. It opens instantly without needing Python, Pandas, or PyArrow.

### Q: Does Parquet Viewer upload my data to any external server?
**A:** No. Parquet Viewer is **100% local-first and offline**. All file reads, SQL queries, column statistics, and decompression happen in memory on your local CPU.

### Q: Does it support Apache Spark INT96 timestamps and complex nested lists?
**A:** Yes. Parquet Viewer includes dedicated decoders for Spark `INT96` nanosecond timestamps, timestamp millis/micros, UUIDs, decimals, and nested `LIST` / `STRUCT` schemas.

### Q: Can I export Parquet files to CSV or JSON?
**A:** Yes. Click the **Export** button in the header to export the full table or filtered records to CSV, TSV, JSON, or NDJSON (JSONL).

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Electron 34                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                     React 19                          │  │
│  │  ┌───────────────┐ ┌───────────────┐ ┌─────────────┐  │  │
│  │  │   Data Grid   │ │  SQL Console  │ │  Analytics  │  │  │
│  │  └───────┬───────┘ └───────┬───────┘ └──────┬──────┘  │  │
│  │          └─────────────────┼────────────────┘         │  │
│  │                   In-Memory Engine                    │  │
│  │         (hyparquet + pure JS decompressors)           │  │
│  └────────────────────────────┬──────────────────────────┘  │
│                               │ IPC Bridge                  │
│  ┌────────────────────────────┴──────────────────────────┐  │
│  │                  Node.js / Native I/O                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

- **Runtime**: [Electron 34](https://www.electronjs.org/)
- **UI Framework**: [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- **Build System**: [Vite 6](https://vitejs.dev/) + [Tailwind CSS](https://tailwindcss.com/)
- **Parquet Parser**: Streaming parser via [`hyparquet`](https://github.com/hyparam/hyparquet) + [`hyparquet-compressors`](https://github.com/hyparam/hyparquet-compressors)
- **Exporting**: [`papaparse`](https://www.papaparse.com/) + native JSON streamers

---

## 🛠️ Build from Source

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**

```bash
# 1. Clone the repository
git clone https://github.com/pranayvarshney/parquet-viewer.git
cd parquet-viewer

# 2. Install dependencies
npm install

# 3. Start development server with live reload
npm run dev:electron

# 4. Build production DMG installer
npm run build
npm run dist
```

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!  
Feel free to open an issue on the [Issues page](https://github.com/pranayvarshney/parquet-viewer/issues) or submit a pull request.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.
