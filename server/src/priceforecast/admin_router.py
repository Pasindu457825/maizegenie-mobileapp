from fastapi import APIRouter, HTTPException
from datetime import datetime
from src.database.db import get_connection

router = APIRouter()

# ==========================
# GET latest entry
# ==========================
@router.get("/api/admin/price-data")
def get_price_data():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM price_config ORDER BY id DESC LIMIT 1")
    row = cur.fetchone()
    conn.close()

    if row:
        return {
            "success": True,
            "data": {
                "fuelPrice": row["fuel_price"],
                "importTax": row["import_tax"],
                "farmGatePrice": row["farm_gate_price"],
                "lastUpdated": row["updated_at"],
            },
        }

    # Default if table empty
    return {
        "success": True,
        "data": {
            "fuelPrice": 380.0,
            "importTax": 25.0,
            "farmGatePrice": 115.0,
            "lastUpdated": None,
        },
    }


# ==========================
# INSERT new price config
# ==========================
@router.post("/api/admin/price-data")
def update_price_data(req: dict):
    required = ["fuelPrice", "importTax", "farmGatePrice"]
    if not all(k in req for k in required):
        raise HTTPException(status_code=400, detail="Missing required fields")

    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """INSERT INTO price_config (fuel_price, import_tax, farm_gate_price, updated_at)
           VALUES (?, ?, ?, ?)""",
        (
            req["fuelPrice"],
            req["importTax"],
            req["farmGatePrice"],
            datetime.now().isoformat(),
        ),
    )

    conn.commit()
    conn.close()

    return {"success": True, "message": "Saved!", "data": req}
