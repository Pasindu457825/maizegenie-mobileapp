from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest

from core.auth_dependencies import get_current_user
from pestidentify import router as pest_router
from pestidentify.premium_service import PremiumPestServiceError


@pytest.fixture
def app():
    app = FastAPI()
    app.include_router(pest_router.router)
    yield app
    app.dependency_overrides.clear()


@pytest.fixture
def client(app):
    return TestClient(app)


def override_user(user_id="farmer-1", role="farmer"):
    return {"id": user_id, "email": "user@example.com", "role": role}


def test_identify_pest_local_success_returns_prediction_and_logs(client, app, monkeypatch):
    app.dependency_overrides[get_current_user] = lambda: override_user()

    captured = {}

    def fake_predict(image_bytes, conf=0.4, return_image=False, model_name="local"):
        captured["predict"] = {
            "image_bytes": image_bytes,
            "conf": conf,
            "return_image": return_image,
            "model_name": model_name,
        }
        return {
            "predictions": [
                {
                    "class_id": 0,
                    "class_name": "Armyworm",
                    "confidence": 0.91,
                    "box_xyxy": [1.0, 2.0, 3.0, 4.0],
                }
            ],
            "annotated_image_b64": None,
        }

    def fake_log(predictions, source="identify_api", user_id=None, user_role=None):
        captured["log"] = {
            "predictions": predictions,
            "source": source,
            "user_id": user_id,
            "user_role": user_role,
        }
        return {"logged": True}

    monkeypatch.setattr(pest_router, "predict_pest", fake_predict)
    monkeypatch.setattr(pest_router, "log_pest_detection", fake_log)

    response = client.post(
        "/api/pest/identify?conf=0.4&return_image=false&model=local",
        files={"file": ("pest.jpg", b"fake-image-bytes", "image/jpeg")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["predictions"][0]["class_name"] == "Armyworm"
    assert captured["predict"]["model_name"] == "local"
    assert captured["log"]["user_id"] == "farmer-1"
    assert captured["log"]["user_role"] == "farmer"


def test_identify_pest_rejects_empty_upload(client, app):
    app.dependency_overrides[get_current_user] = lambda: override_user()

    response = client.post(
        "/api/pest/identify",
        files={"file": ("empty.jpg", b"", "image/jpeg")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Empty upload"


def test_identify_pest_premium_requires_active_subscription(client, app, monkeypatch):
    app.dependency_overrides[get_current_user] = lambda: override_user()
    monkeypatch.setattr(pest_router, "_has_active_subscription", lambda user_id: False)

    response = client.post(
        "/api/pest/identify?model=premium",
        files={"file": ("pest.jpg", b"fake-image-bytes", "image/jpeg")},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Premium pest model requires an active subscription"


def test_identify_pest_premium_credit_exhaustion_returns_friendly_503(client, app, monkeypatch):
    app.dependency_overrides[get_current_user] = lambda: override_user()
    monkeypatch.setattr(pest_router, "_has_active_subscription", lambda user_id: True)

    def fake_predict_premium(image_bytes, conf=0.4, return_image=False):
        raise PremiumPestServiceError(
            "Premium pest service is temporarily unavailable because inference credits are exhausted. Please try the local model or contact support.",
            status_code=503,
            code="premium_credits_exhausted",
        )

    monkeypatch.setattr(pest_router, "predict_pest_premium", fake_predict_premium)

    response = client.post(
        "/api/pest/identify?model=premium",
        files={"file": ("pest.jpg", b"fake-image-bytes", "image/jpeg")},
    )

    assert response.status_code == 503
    assert (
        response.json()["detail"]
        == "Premium pest service is temporarily unavailable because inference credits are exhausted. Please try the local model or contact support."
    )


def test_frequency_uses_farmer_id_for_farmer_role(client, app, monkeypatch):
    app.dependency_overrides[get_current_user] = lambda: override_user(user_id="farmer-123", role="farmer")

    captured = {}

    def fake_stats(days=30, top_n=5, user_id=None):
        captured["args"] = {"days": days, "top_n": top_n, "user_id": user_id}
        return {
            "days": days,
            "user_id": user_id,
            "total_requests": 2,
            "no_pest_requests": 1,
            "total_detections": 1,
            "top_pests": [{"class_name": "Armyworm", "count": 1}],
            "daily_detection_series": [],
            "log_file": "tests/log.jsonl",
        }

    monkeypatch.setattr(pest_router, "get_pest_frequency_stats", fake_stats)

    response = client.get("/api/pest/frequency?days=7&top_n=3")

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert captured["args"] == {"days": 7, "top_n": 3, "user_id": "farmer-123"}


def test_frequency_allows_officer_to_query_specific_farmer(client, app, monkeypatch):
    app.dependency_overrides[get_current_user] = lambda: override_user(user_id="officer-1", role="officer")

    captured = {}

    def fake_stats(days=30, top_n=5, user_id=None):
        captured["args"] = {"days": days, "top_n": top_n, "user_id": user_id}
        return {
            "days": days,
            "user_id": user_id,
            "total_requests": 5,
            "no_pest_requests": 0,
            "total_detections": 5,
            "top_pests": [{"class_name": "Bollworm", "count": 3}],
            "daily_detection_series": [],
            "log_file": "tests/log.jsonl",
        }

    monkeypatch.setattr(pest_router, "get_pest_frequency_stats", fake_stats)

    response = client.get("/api/pest/frequency?days=14&top_n=4&farmer_id=farmer-999")

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert captured["args"] == {"days": 14, "top_n": 4, "user_id": "farmer-999"}
