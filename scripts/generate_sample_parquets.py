import os
import pyarrow as pa
import pyarrow.parquet as pq
import pandas as pd
import numpy as np
import datetime
import random

os.makedirs('sample_datasets', exist_ok=True)

print("Generating sample Parquet files...")

# 1. E-Commerce Orders (Snappy)
n_orders = 10000
categories = ['Electronics', 'Home', 'Apparel', 'Books', 'Outdoors', 'Cosmetics']
statuses = ['Shipped', 'Delivered', 'Cancelled', 'Processing', 'Returned']
regions = ['US-East', 'US-West', 'EU-Central', 'APAC-North', 'LATAM-South']

np.random.seed(42)
random.seed(42)

base_date = datetime.datetime(2025, 1, 1)

orders_df = pd.DataFrame({
    'order_id': [f"ORD-{100000 + i}" for i in range(n_orders)],
    'customer_id': [f"CUST-{random.randint(1000, 9999)}" for _ in range(n_orders)],
    'order_date': [base_date + datetime.timedelta(minutes=int(np.random.exponential(120) * i / 10)) for i in range(n_orders)],
    'category': np.random.choice(categories, n_orders),
    'product_title': [f"Product SKU-{random.randint(100, 999)}" for _ in range(n_orders)],
    'quantity': np.random.randint(1, 10, n_orders),
    'unit_price': np.round(np.random.uniform(5.99, 899.99, n_orders), 2),
    'tax_amount': np.round(np.random.uniform(0.50, 45.00, n_orders), 2),
    'is_express_delivery': np.random.choice([True, False], n_orders, p=[0.35, 0.65]),
    'region': np.random.choice(regions, n_orders),
    'order_status': np.random.choice(statuses, n_orders, p=[0.55, 0.25, 0.05, 0.10, 0.05]),
    'rating': [random.choice([1, 2, 3, 4, 5, None]) for _ in range(n_orders)],
})

orders_df['total_amount'] = np.round(orders_df['quantity'] * orders_df['unit_price'] + orders_df['tax_amount'], 2)

table_orders = pa.Table.from_pandas(orders_df)
pq.write_table(table_orders, 'sample_datasets/ecommerce_orders_snappy.parquet', compression='SNAPPY', row_group_size=2500)
print("-> Created sample_datasets/ecommerce_orders_snappy.parquet (10,000 rows, 4 row groups, Snappy)")

# 2. User Profiles with Nested Structs & Lists (ZSTD)
n_users = 5000
users_data = []

for i in range(n_users):
    user_id = f"usr_{10000 + i}"
    name = f"User_{i}"
    email = f"user_{i}@example.com"
    age = random.randint(18, 75)
    is_active = random.random() > 0.15
    signup_date = base_date + datetime.timedelta(days=random.randint(0, 400))
    
    # Nested struct: address
    address = {
        'street': f"{random.randint(10, 999)} Main Blvd",
        'city': random.choice(['San Francisco', 'New York', 'London', 'Tokyo', 'Berlin', 'Toronto']),
        'postal_code': f"{random.randint(10000, 99999)}",
        'country': random.choice(['USA', 'UK', 'Japan', 'Germany', 'Canada']),
    }
    
    # Nested list: roles & interests
    roles = random.sample(['admin', 'editor', 'viewer', 'billing', 'analyst'], k=random.randint(1, 3))
    scores = [round(random.uniform(50.0, 100.0), 1) for _ in range(random.randint(1, 4))]
    
    users_data.append({
        'user_id': user_id,
        'username': name,
        'email': email,
        'age': age,
        'is_active': is_active,
        'signup_timestamp': signup_date,
        'address': address,
        'roles': roles,
        'performance_scores': scores,
        'credit_balance': round(random.uniform(0.0, 2500.0), 2) if random.random() > 0.2 else None
    })

users_df = pd.DataFrame(users_data)
table_users = pa.Table.from_pandas(users_df)
pq.write_table(table_users, 'sample_datasets/user_profiles_nested_zstd.parquet', compression='ZSTD', row_group_size=1000)
print("-> Created sample_datasets/user_profiles_nested_zstd.parquet (5,000 rows, nested structs & lists, ZSTD)")

# 3. High-Frequency IoT Sensor Metrics (GZIP)
n_sensor_rows = 15000
sensors = [f"sensor-node-{k:02d}" for k in range(1, 12)]
locations = ['Building A - Floor 1', 'Building A - Floor 2', 'Building B - Roof', 'Warehouse East', 'DataCenter Sub-01']

sensor_rows = []
cur_time = datetime.datetime(2026, 1, 1, 0, 0, 0)

for i in range(n_sensor_rows):
    cur_time += datetime.timedelta(seconds=15)
    sens = random.choice(sensors)
    loc = random.choice(locations)
    temp = round(random.normalvariate(23.5, 4.2), 2)
    humidity = round(random.uniform(30.0, 85.0), 1)
    pressure_hpa = round(random.normalvariate(1013.25, 8.0), 2)
    battery_v = round(random.uniform(3.1, 4.2), 2)
    status_code = random.choice([200, 200, 200, 200, 304, 500, 503])
    
    sensor_rows.append({
        'reading_id': i + 1,
        'timestamp': cur_time,
        'sensor_id': sens,
        'location': loc,
        'temperature_c': temp,
        'humidity_pct': humidity,
        'pressure_hpa': pressure_hpa,
        'battery_voltage': battery_v,
        'is_anomaly': temp > 32.0 or battery_v < 3.25,
        'status_code': status_code
    })

sensor_df = pd.DataFrame(sensor_rows)
table_sensors = pa.Table.from_pandas(sensor_df)
pq.write_table(table_sensors, 'sample_datasets/sensor_metrics_multigroup_gzip.parquet', compression='GZIP', row_group_size=3000)
print("-> Created sample_datasets/sensor_metrics_multigroup_gzip.parquet (15,000 rows, 5 row groups, GZIP)")

print("All sample parquet datasets successfully generated in ./sample_datasets/!")
