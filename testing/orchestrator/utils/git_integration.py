"""
Git 集成工具：获取变更文件，映射受影响的应用与测试范围
"""

from __future__ import annotations

import os
import subprocess
from pathlib import Path
from typing import List, Optional, Set, Tuple


class GitManager:
    def __init__(self, repo_root: Optional[str] = None) -> None:
        self.repo_root = Path(
            repo_root or Path(__file__).resolve().parents[3]
        ).as_posix()

    def _run(self, args: List[str], cwd: Optional[str] = None) -> Tuple[int, str, str]:
        process = subprocess.Popen(
            args,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=cwd or self.repo_root,
            text=True,
        )
        out, err = process.communicate()
        return process.returncode, out.strip(), err.strip()

    def get_changed_files(
        self, base_ref: str = "origin/main", head_ref: str = "HEAD"
    ) -> List[str]:
        # 优先确保有远程引用，失败则退回 HEAD~1
        code, out, _ = self._run(["git", "rev-parse", "--verify", base_ref])
        if code != 0:
            base_ref = f"{head_ref}~1"

        code, out, err = self._run(
            ["git", "diff", "--name-only", f"{base_ref}..{head_ref}"]
        )
        if code != 0:
            return []
        files = [f for f in out.splitlines() if f]
        return files

    def map_files_to_apps(self, files: List[str]) -> Set[str]:
        affected: Set[str] = set()
        for f in files:
            parts = f.split("/")
            if len(parts) >= 2 and parts[0] == "apps":
                affected.add(parts[1])
            elif parts[0] == "shared":
                # 共享代码影响所有前端，以及可能的后端
                affected.update({"blog", "lowcode", "mobile", "server"})
        return affected

    def expand_with_dependencies(self, apps: Set[str]) -> Set[str]:
        # 简单依赖展开：blog/lowcode/mobile 依赖 server
        expanded = set(apps)
        deps = {"blog": ["server"], "lowcode": ["server"], "mobile": ["server"]}
        for a in list(expanded):
            for d in deps.get(a, []):
                expanded.add(d)
        return expanded
