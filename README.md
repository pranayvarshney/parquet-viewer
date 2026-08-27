# 🔍 Parquet Viewer

<div align="center">

**The fastest, local-first desktop Parquet file viewer, SQL editor, and data profiler for macOS.**

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-macOS%20(Apple%20Silicon%20%26%20Intel)-indigo.svg)]()
[![Electron](https://img.shields.io/badge/Electron-34.x-blue.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg)](https://www.typescriptlang.org/)
[![Pure JavaScript Engine](https://img.shields.io/badge/Engine-hyparquet%20(100%25%20Offline)-purple.svg)](https://github.com/hyparam/hyparquet)

[Features](#-key-features) • [Installation](#-installation) • [Usage Guide](#-usage-guide) • [Keyboard Shortcuts](#-keyboard-shortcuts) • [Architecture](#-architecture) • [Development](#-development--contributing)

</div>

---

## 💡 Why Parquet Viewer?

Data engineers, analytics engineers, data scientists, and ML developers frequently deal with Apache Parquet files across data lakes (S3, GCS), DuckDB pipelines, Spark jobs, and model eval snapshots.

Opening and inspecting `.parquet` files usually requires writing Python scripts, firing up Jupyter Notebooks, or running CLI tools.

**Parquet Viewer** delivers an instant, standalone, high-performance desktop application to open, search, filter, profile, and run SQL queries on any `.parquet` file with **zero Python or JVM dependencies** — completely offline and privacy-first.

---

## ✨ Key Features

### ⚡ 1. 100% Local-First & Blazing Fast
- Powered by [`hyparquet`](https://github.com/hyparam/hyparquet), a pure JavaScript/TypeScript streaming Parquet parser.
- Built-in offline decompression for **Snappy**, **ZSTD**, **GZIP**, **Brotli**, and **LZ4**.
- Instant drag-and-drop loading for 100K+ rows with near-zero memory footprint.

### 📊 2. High-Performance Virtualized Table Grid
- Smooth infinite scrolling and pagination.
- **Type-Aware Renderers**: Distinct visual pills for booleans with status dots, formatted numerics, formatted ISO timestamps (including Spark `INT96`), UUIDs, and complex structs.
- **Column Operations**: Column pinning/freezing, sorting, multi-column search, and predicate filters (`=`, `!=`, `>`, `<`, `contains`, `is null`).
- **Multi-File Workspace**: Open multiple Parquet files side-by-side in separate tabs.

### 🔍 3. Deep Cell Detail Inspector
- **Expand Any Cell**: Double-click any cell or hover and click <kbd>⤢</kbd> to inspect long text, logs, trajectories, and nested structs.
- **Interactive JSON Tree**: Expand and collapse deeply nested objects, dictionaries, and arrays.
- **Nested Table View**: Automatically formats arrays of objects as interactive sub-tables.
- **In-Cell Search & Word Wrap**: Search within large 100KB+ cell strings and toggle word wrap.
- **1-Click Copy**: Copy formatted JSON or raw strings to clipboard instantly.

### 💻 4. Embedded In-Memory SQL Console
- Run SQL queries directly against your loaded dataset:
  ```sql
  SELECT category, COUNT(*) AS count, AVG(total_amount) AS avg_sales 
  FROM parquet 
  GROUP BY category 
  ORDER BY avg_sales DESC;
  ```
- Instant query templates for fast exploratory data analysis.
- Execution timers (millisecond precision) and direct CSV export for query results.

### 📈 5. Column Profiler & Statistical Analytics
- Deep statistics and visual summaries for every column:
  - **Numeric metrics**: Min, Max, Mean (Average), Standard Deviation ($\sigma$).
  - **Categorical metrics**: Unique value counts, missing/null ratio, frequency distributions.
  - **Histograms**: Gradient value distribution charts.

### 🧬 6. Schema & Row Group Explorer
- Inspect high-level logical types, physical encodings, and repetition levels (`REQUIRED`, `OPTIONAL`, `REPEATED`).
- Row group breakdown: Uncompressed vs compressed byte sizes, compression ratios, dictionary encodings, and chunk offsets.
- View embedded Parquet key-value metadata (e.g. Pandas versions, creator engines).

### 📤 7. Multi-Format Exporter & Polyglot Code Generator
- Export full or filtered datasets to **CSV**, **TSV**, **JSON**, and **NDJSON / JSONL** (preserving nested arrays and structs as native JSON values).
- Instant code snippets generator for:
  - 🐍 **Python Pandas** (`pd.read_parquet`)
  - ⚡ **Python Polars** (`pl.read_parquet`)
  - 🦆 **DuckDB** (Python, Node.js & CLI)
  - 🏹 **Apache PyArrow** (`pq.read_table`)

### 🎨 8. Refined Modern Aesthetic
- Dark carbon surface palette (`#0c0c0e`, `#121215`, `#18181c`) with subtle glassmorphism and glowing accent indicators.

---

## 📥 Installation

### macOS (Apple Silicon & Intel)

1. Download the latest **`ParquetViewer.dmg`** from the [Releases](https://github.com/pranayvarshney/parquet-viewer/releases) page.
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

## 🏗️ Architecture

Parquet Viewer is built with modern, performant web and desktop technologies:

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

## 🛠️ Development & Contributing

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**

### Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/pranayvarshney/parquet-viewer.git
cd parquet-viewer

# 2. Install dependencies
npm install

# 3. Start development server with live reload
npm run dev:electron
```

### Production Build & Packaging

```bash
# Compile TypeScript & bundle Vite assets
npm run build

# Package local macOS .app bundle
npm run dist:dir

# Build distribution DMG installer
npm run dist
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/pranayvarshney/parquet-viewer/issues) to report bugs or request new features.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.
