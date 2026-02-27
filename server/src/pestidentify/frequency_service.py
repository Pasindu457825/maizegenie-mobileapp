from __future__ import annotations

from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List
import json
import uuid


LOG_DIR = Path(__file__).resolve().parent / "data"
LOG_FILE = LOG_DIR / "pest_detection_logs.jsonl"


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _safe_float(value: Any) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def _extract_detected_pests(predictions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    detected: List[Dict[str, Any]] = []
    for p in predictions or []:
        class_id = p.get("class_id", -1)
        class_name = (p.get("class_name") or "").strip()
        if class_id is None or int(class_id) < 0:
            continue
        if not class_name or class_name.lower() == "no pest detected":
            continue
        detected.append(
            {
                "class_id": int(class_id),
                "class_name": class_name,
                "confidence": round(_safe_float(p.get("confidence")), 3),
            }
        )
    return detected


def log_pest_detection(
    predictions: List[Dict[str, Any]],
    source: str = "identify_api",
    user_id: str | None = None,
    user_role: str | None = None,
) -> Dict[str, Any]:
    detected_pests = _extract_detected_pests(predictions)
    event = {
        "id": str(uuid.uuid4()),
        "created_at": _utc_now_iso(),
        "source": source,
        "user_id": user_id,
        "user_role": user_role,
        "total_detections": len(detected_pests),
        "detected_pests": detected_pests,
    }

    LOG_DIR.mkdir(parents=True, exist_ok=True)
    with LOG_FILE.open("a", encoding="utf-8") as f:
        f.write(json.dumps(event, ensure_ascii=True) + "\n")

    return {
        "event_id": event["id"],
        "logged": True,
        "total_detections": event["total_detections"],
    }


def _load_logs(days: int, user_id: str | None = None) -> List[Dict[str, Any]]:
    if not LOG_FILE.exists():
        return []

    cutoff = datetime.now(timezone.utc) - timedelta(days=max(days, 1))
    records: List[Dict[str, Any]] = []

    with LOG_FILE.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                event = json.loads(line)
                created_at_raw = event.get("created_at")
                if not created_at_raw:
                    continue
                created_at = datetime.fromisoformat(created_at_raw.replace("Z", "+00:00"))
                if created_at < cutoff:
                    continue
                if user_id and event.get("user_id") != user_id:
                    continue
                records.append(event)
            except Exception:
                continue

    return records


def get_pest_frequency_stats(days: int = 30, top_n: int = 5, user_id: str | None = None) -> Dict[str, Any]:
    records = _load_logs(days=days, user_id=user_id)
    pest_counts: Counter[str] = Counter()
    daily_detection_counts: Counter[str] = Counter()
    no_pest_requests = 0
    total_detections = 0

    for event in records:
        pests = event.get("detected_pests") or []
        if not pests:
            no_pest_requests += 1
            continue

        for pest in pests:
            name = (pest.get("class_name") or "").strip()
            if not name:
                continue
            pest_counts[name] += 1
            total_detections += 1

        created_at_raw = event.get("created_at", "")
        date_key = created_at_raw[:10] if len(created_at_raw) >= 10 else "unknown"
        daily_detection_counts[date_key] += len(pests)

    top_pests = [
        {"class_name": name, "count": count}
        for name, count in pest_counts.most_common(max(top_n, 1))
    ]
    daily_series = [
        {"date": date_key, "detections": daily_detection_counts[date_key]}
        for date_key in sorted(daily_detection_counts.keys())
    ]

    return {
        "days": max(days, 1),
        "user_id": user_id,
        "total_requests": len(records),
        "no_pest_requests": no_pest_requests,
        "total_detections": total_detections,
        "top_pests": top_pests,
        "daily_detection_series": daily_series,
        "log_file": str(LOG_FILE),
    }
