"""
Flaky 用例存储与读取
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List, Optional

DEFAULT_PATH = Path(__file__).resolve().parents[2] / "flaky-list.json"


class FlakyStore:
    def __init__(self, store_path: Optional[Path] = None) -> None:
        self.path = Path(store_path) if store_path else DEFAULT_PATH

    def read(self) -> Dict[str, List[str]]:
        if not self.path.exists():
            return {"tests": []}
        try:
            data = json.loads(self.path.read_text(encoding="utf-8"))
            if not isinstance(data, dict) or "tests" not in data:
                return {"tests": []}
            if not isinstance(data["tests"], list):
                data["tests"] = []
            return data
        except Exception:
            return {"tests": []}

    def add(self, test_id: str) -> None:
        data = self.read()
        tests = set(data.get("tests", []))
        tests.add(test_id)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(
            json.dumps({"tests": sorted(tests)}, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

    def contains(self, test_id: str) -> bool:
        data = self.read()
        return test_id in set(data.get("tests", []))
