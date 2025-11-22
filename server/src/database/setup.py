from db import get_connection

conn = get_connection()
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS price_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fuel_price REAL NOT NULL,
    import_tax REAL NOT NULL,
    farm_gate_price REAL NOT NULL,
    updated_at TEXT NOT NULL
)
""")

conn.commit()
conn.close()

print("Table created successfully!")
