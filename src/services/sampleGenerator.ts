import { ParquetDataFile } from '../types/parquet';

export interface SampleDatasetInfo {
  id: string;
  name: string;
  filename: string;
  description: string;
  rowCount: number;
  tags: string[];
  generate: () => ParquetDataFile;
}

const CATEGORIES = ['Electronics', 'Home & Kitchen', 'Books', 'Fashion', 'Sports', 'Beauty & Health', 'Toys & Games', 'Automotive'];
const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'];
const STATUSES = ['Completed', 'Pending', 'Processing', 'Cancelled', 'Refunded'];
const PAYMENT_METHODS = ['Credit Card', 'PayPal', 'Apple Pay', 'Google Pay', 'Crypto'];

export function generateSalesSample(count = 2500): ParquetDataFile {
  const rows: Record<string, any>[] = [];
  const startDate = new Date('2025-01-01T00:00:00Z').getTime();
  const endDate = new Date('2026-02-15T00:00:00Z').getTime();

  for (let i = 1; i <= count; i++) {
    const orderDate = new Date(startDate + Math.random() * (endDate - startDate));
    const qty = Math.floor(Math.random() * 8) + 1;
    const unitPrice = parseFloat((Math.random() * 450 + 10).toFixed(2));
    const discount = Math.random() > 0.6 ? parseFloat((Math.random() * 0.3).toFixed(2)) : 0;
    const totalAmount = parseFloat((qty * unitPrice * (1 - discount)).toFixed(2));
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const payment = PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)];

    rows.push({
      _rowIndex: i - 1,
      order_id: `ORD-${2025000 + i}`,
      customer_id: `CUST-${1000 + (i % 350)}`,
      timestamp: orderDate,
      category,
      product_name: `${category} Item #${(i % 45) + 1}`,
      quantity: qty,
      unit_price: unitPrice,
      discount_rate: discount,
      total_amount: totalAmount,
      currency: 'USD',
      status,
      region,
      payment_method: payment,
      is_first_purchase: Math.random() > 0.75,
      delivery_days: status === 'Completed' ? Math.floor(Math.random() * 6) + 1 : null,
      customer_tags: ['loyal', 'vip', 'promotional', 'mobile_app'].filter(() => Math.random() > 0.6),
    });
  }

  return {
    id: `sales-sample-${Date.now()}`,
    name: 'ecommerce_sales_2025_2026.parquet',
    totalRows: count,
    loadedAt: new Date(),
    columns: [
      'order_id',
      'customer_id',
      'timestamp',
      'category',
      'product_name',
      'quantity',
      'unit_price',
      'discount_rate',
      'total_amount',
      'currency',
      'status',
      'region',
      'payment_method',
      'is_first_purchase',
      'delivery_days',
      'customer_tags',
    ],
    columnTypes: {
      order_id: 'string',
      customer_id: 'string',
      timestamp: 'timestamp',
      category: 'string',
      product_name: 'string',
      quantity: 'int32',
      unit_price: 'double',
      discount_rate: 'double',
      total_amount: 'double',
      currency: 'string',
      status: 'string',
      region: 'string',
      payment_method: 'string',
      is_first_purchase: 'boolean',
      delivery_days: 'int32',
      customer_tags: 'list',
    },
    rows,
    metadata: {
      fileName: 'ecommerce_sales_2025_2026.parquet',
      fileSizeBytes: count * 180,
      numRows: count,
      numColumns: 16,
      numRowGroups: 2,
      createdBy: 'parquet-lens-generator (Apache Parquet 2.10)',
      keyValueMetadata: {
        'pandas_version': '2.2.0',
        'creator': 'ParquetLens Built-in Engine',
      },
      columns: [
        { name: 'order_id', path: ['order_id'], type: 'string', physicalType: 'BYTE_ARRAY', logicalType: 'UTF8', repetitionType: 'REQUIRED', compression: 'SNAPPY' },
        { name: 'customer_id', path: ['customer_id'], type: 'string', physicalType: 'BYTE_ARRAY', logicalType: 'UTF8', repetitionType: 'REQUIRED', compression: 'SNAPPY' },
        { name: 'timestamp', path: ['timestamp'], type: 'timestamp', physicalType: 'INT64', logicalType: 'TIMESTAMP(MICROS)', repetitionType: 'REQUIRED', compression: 'SNAPPY' },
        { name: 'category', path: ['category'], type: 'string', physicalType: 'BYTE_ARRAY', logicalType: 'UTF8', repetitionType: 'REQUIRED', compression: 'SNAPPY' },
        { name: 'product_name', path: ['product_name'], type: 'string', physicalType: 'BYTE_ARRAY', logicalType: 'UTF8', repetitionType: 'OPTIONAL', compression: 'SNAPPY' },
        { name: 'quantity', path: ['quantity'], type: 'int32', physicalType: 'INT32', logicalType: 'INT(32, signed)', repetitionType: 'REQUIRED', compression: 'SNAPPY' },
        { name: 'unit_price', path: ['unit_price'], type: 'double', physicalType: 'DOUBLE', repetitionType: 'REQUIRED', compression: 'SNAPPY' },
        { name: 'discount_rate', path: ['discount_rate'], type: 'double', physicalType: 'DOUBLE', repetitionType: 'REQUIRED', compression: 'SNAPPY' },
        { name: 'total_amount', path: ['total_amount'], type: 'double', physicalType: 'DOUBLE', repetitionType: 'REQUIRED', compression: 'SNAPPY' },
        { name: 'currency', path: ['currency'], type: 'string', physicalType: 'BYTE_ARRAY', logicalType: 'UTF8', repetitionType: 'REQUIRED', compression: 'SNAPPY' },
        { name: 'status', path: ['status'], type: 'string', physicalType: 'BYTE_ARRAY', logicalType: 'UTF8', repetitionType: 'REQUIRED', compression: 'SNAPPY' },
        { name: 'region', path: ['region'], type: 'string', physicalType: 'BYTE_ARRAY', logicalType: 'UTF8', repetitionType: 'REQUIRED', compression: 'SNAPPY' },
        { name: 'payment_method', path: ['payment_method'], type: 'string', physicalType: 'BYTE_ARRAY', logicalType: 'UTF8', repetitionType: 'REQUIRED', compression: 'SNAPPY' },
        { name: 'is_first_purchase', path: ['is_first_purchase'], type: 'boolean', physicalType: 'BOOLEAN', repetitionType: 'REQUIRED', compression: 'SNAPPY' },
        { name: 'delivery_days', path: ['delivery_days'], type: 'int32', physicalType: 'INT32', repetitionType: 'OPTIONAL', compression: 'SNAPPY' },
        { name: 'customer_tags', path: ['customer_tags'], type: 'list', physicalType: 'GROUP', logicalType: 'LIST', repetitionType: 'OPTIONAL', compression: 'SNAPPY' },
      ],
      rowGroups: [
        {
          index: 0,
          numRows: Math.floor(count / 2),
          totalByteSize: Math.floor(count * 90),
          totalCompressedSize: Math.floor(count * 45),
          columns: [],
        },
        {
          index: 1,
          numRows: Math.ceil(count / 2),
          totalByteSize: Math.floor(count * 90),
          totalCompressedSize: Math.floor(count * 45),
          columns: [],
        },
      ],
    },
  };
}

export function generateIoTLogSample(count = 2000): ParquetDataFile {
  const rows: Record<string, any>[] = [];
  const devices = ['sensor-alpha-01', 'sensor-beta-04', 'edge-gateway-12', 'temp-node-77', 'power-meter-3'];
  const locations = ['Server Room A', 'Warehouse 3', 'Factory Floor 1', 'Rooftop Solar Array', 'Cold Storage B'];
  const logLevels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];

  const startTime = Date.now() - 86400000 * 7;

  for (let i = 1; i <= count; i++) {
    const devIdx = Math.floor(Math.random() * devices.length);
    const temp = parseFloat((20 + Math.random() * 45).toFixed(2));
    const humidity = parseFloat((30 + Math.random() * 60).toFixed(1));
    const voltage = parseFloat((220 + (Math.random() * 20 - 10)).toFixed(2));
    const isOverheating = temp > 58;

    rows.push({
      _rowIndex: i - 1,
      event_id: `EVT-${Date.now().toString(36)}-${i.toString().padStart(5, '0')}`,
      timestamp: new Date(startTime + i * 180000 + Math.floor(Math.random() * 60000)),
      device_id: devices[devIdx],
      location: locations[devIdx],
      level: isOverheating ? 'WARN' : logLevels[Math.floor(Math.random() * logLevels.length)],
      temperature_c: temp,
      humidity_pct: humidity,
      voltage_v: voltage,
      cpu_usage_pct: parseFloat((10 + Math.random() * 85).toFixed(1)),
      memory_free_mb: Math.floor(512 + Math.random() * 3500),
      is_alert_triggered: isOverheating,
      firmware_version: 'v2.4.12-build89',
      metadata: {
        battery_level: Math.floor(60 + Math.random() * 40),
        rssi_dbm: -1 * Math.floor(40 + Math.random() * 50),
        protocol: 'MQTT/TLS',
      },
    });
  }

  return {
    id: `iot-sample-${Date.now()}`,
    name: 'iot_telemetry_sensors.parquet',
    totalRows: count,
    loadedAt: new Date(),
    columns: [
      'event_id',
      'timestamp',
      'device_id',
      'location',
      'level',
      'temperature_c',
      'humidity_pct',
      'voltage_v',
      'cpu_usage_pct',
      'memory_free_mb',
      'is_alert_triggered',
      'firmware_version',
      'metadata',
    ],
    columnTypes: {
      event_id: 'string',
      timestamp: 'timestamp',
      device_id: 'string',
      location: 'string',
      level: 'string',
      temperature_c: 'double',
      humidity_pct: 'double',
      voltage_v: 'double',
      cpu_usage_pct: 'double',
      memory_free_mb: 'int32',
      is_alert_triggered: 'boolean',
      firmware_version: 'string',
      metadata: 'struct',
    },
    rows,
    metadata: {
      fileName: 'iot_telemetry_sensors.parquet',
      fileSizeBytes: count * 160,
      numRows: count,
      numColumns: 13,
      numRowGroups: 1,
      createdBy: 'duckdb 1.1.0 / pyarrow 18.0.0',
      keyValueMetadata: {
        'compression': 'ZSTD',
        'sensor_fleet': 'Production Cluster #4',
      },
      columns: [
        { name: 'event_id', path: ['event_id'], type: 'string', physicalType: 'BYTE_ARRAY', logicalType: 'UTF8', repetitionType: 'REQUIRED', compression: 'ZSTD' },
        { name: 'timestamp', path: ['timestamp'], type: 'timestamp', physicalType: 'INT64', logicalType: 'TIMESTAMP(MICROS)', repetitionType: 'REQUIRED', compression: 'ZSTD' },
        { name: 'device_id', path: ['device_id'], type: 'string', physicalType: 'BYTE_ARRAY', logicalType: 'UTF8', repetitionType: 'REQUIRED', compression: 'ZSTD' },
        { name: 'location', path: ['location'], type: 'string', physicalType: 'BYTE_ARRAY', logicalType: 'UTF8', repetitionType: 'REQUIRED', compression: 'ZSTD' },
        { name: 'level', path: ['level'], type: 'string', physicalType: 'BYTE_ARRAY', logicalType: 'UTF8', repetitionType: 'REQUIRED', compression: 'ZSTD' },
        { name: 'temperature_c', path: ['temperature_c'], type: 'double', physicalType: 'DOUBLE', repetitionType: 'REQUIRED', compression: 'ZSTD' },
        { name: 'humidity_pct', path: ['humidity_pct'], type: 'double', physicalType: 'DOUBLE', repetitionType: 'REQUIRED', compression: 'ZSTD' },
        { name: 'voltage_v', path: ['voltage_v'], type: 'double', physicalType: 'DOUBLE', repetitionType: 'REQUIRED', compression: 'ZSTD' },
        { name: 'cpu_usage_pct', path: ['cpu_usage_pct'], type: 'double', physicalType: 'DOUBLE', repetitionType: 'REQUIRED', compression: 'ZSTD' },
        { name: 'memory_free_mb', path: ['memory_free_mb'], type: 'int32', physicalType: 'INT32', repetitionType: 'REQUIRED', compression: 'ZSTD' },
        { name: 'is_alert_triggered', path: ['is_alert_triggered'], type: 'boolean', physicalType: 'BOOLEAN', repetitionType: 'REQUIRED', compression: 'ZSTD' },
        { name: 'firmware_version', path: ['firmware_version'], type: 'string', physicalType: 'BYTE_ARRAY', logicalType: 'UTF8', repetitionType: 'OPTIONAL', compression: 'ZSTD' },
        { name: 'metadata', path: ['metadata'], type: 'struct', physicalType: 'GROUP', logicalType: 'STRUCT', repetitionType: 'OPTIONAL', compression: 'ZSTD' },
      ],
      rowGroups: [
        {
          index: 0,
          numRows: count,
          totalByteSize: count * 160,
          totalCompressedSize: Math.floor(count * 65),
          columns: [],
        },
      ],
    },
  };
}

export const SAMPLE_DATASETS: SampleDatasetInfo[] = [
  {
    id: 'sales',
    name: 'E-Commerce Transactions & Revenue',
    filename: 'ecommerce_sales_2025_2026.parquet',
    description: '2,500 realistic multi-category sales records with timestamps, discount rates, customer tags, and regional breakdowns.',
    rowCount: 2500,
    tags: ['E-Commerce', 'Financial', 'Timestamps', 'Lists'],
    generate: () => generateSalesSample(2500),
  },
  {
    id: 'iot',
    name: 'IoT Telemetry & Edge Sensors',
    filename: 'iot_telemetry_sensors.parquet',
    description: '2,000 high-frequency sensor readings with temperature, humidity, nested JSON/struct metadata, and alert flags.',
    rowCount: 2000,
    tags: ['IoT', 'Time Series', 'Telemetry', 'Nested Structs'],
    generate: () => generateIoTLogSample(2000),
  },
];
