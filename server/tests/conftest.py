import os
import sys
import types
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT_DIR / "src"

if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))


os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_ANON_KEY", "test-anon-key")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "test-service-key")
os.environ.setdefault("PEST_FREQUENCY_SUPABASE", "false")


class _FakeSupabaseTable:
    def select(self, *args, **kwargs):
        return self

    def eq(self, *args, **kwargs):
        return self

    def gte(self, *args, **kwargs):
        return self

    def order(self, *args, **kwargs):
        return self

    def single(self):
        return self

    def insert(self, *args, **kwargs):
        return self

    def execute(self):
        return types.SimpleNamespace(data={})


class _FakeSupabaseAuth:
    def get_user(self, token):
        user = types.SimpleNamespace(
            id="test-user",
            email="test@example.com",
            user_metadata={"role": "farmer"},
        )
        return types.SimpleNamespace(user=user)


class _FakeSupabaseClient:
    def __init__(self):
        self.auth = _FakeSupabaseAuth()

    def table(self, name):
        return _FakeSupabaseTable()


fake_supabase_module = types.ModuleType("supabase")
fake_supabase_module.Client = _FakeSupabaseClient
fake_supabase_module.create_client = lambda *args, **kwargs: _FakeSupabaseClient()
sys.modules["supabase"] = fake_supabase_module


class _FakeYOLO:
    def __init__(self, *args, **kwargs):
        pass

    def predict(self, *args, **kwargs):
        return []


fake_ultralytics_module = types.ModuleType("ultralytics")
fake_ultralytics_module.YOLO = _FakeYOLO
sys.modules["ultralytics"] = fake_ultralytics_module


fake_numpy_module = types.ModuleType("numpy")
fake_numpy_module.ndarray = object
fake_numpy_module.array = lambda value: value
sys.modules["numpy"] = fake_numpy_module


fake_cv2_module = types.ModuleType("cv2")
fake_cv2_module.imencode = lambda *args, **kwargs: (True, types.SimpleNamespace(tobytes=lambda: b""))
sys.modules["cv2"] = fake_cv2_module


class _FakeImageObject:
    def convert(self, *args, **kwargs):
        return self


fake_pil_module = types.ModuleType("PIL")
fake_image_namespace = types.SimpleNamespace(open=lambda *args, **kwargs: _FakeImageObject())
fake_pil_module.Image = fake_image_namespace
sys.modules["PIL"] = fake_pil_module


class _FakeInferenceHTTPClient:
    def __init__(self, *args, **kwargs):
        pass

    def infer(self, *args, **kwargs):
        return {"predictions": []}


fake_inference_sdk_module = types.ModuleType("inference_sdk")
fake_inference_sdk_module.InferenceHTTPClient = _FakeInferenceHTTPClient
sys.modules["inference_sdk"] = fake_inference_sdk_module
