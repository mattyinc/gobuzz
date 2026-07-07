import { existsSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const apiDir = join(root, "src", "app", "api");
const tempApiDir = join(root, ".pages-build-api");

if (existsSync(tempApiDir)) {
  if (!existsSync(apiDir)) {
    renameSync(tempApiDir, apiDir);
  } else {
    rmSync(tempApiDir, { recursive: true, force: true });
  }
}

const movedApi = existsSync(apiDir);

try {
  if (movedApi) {
    renameSync(apiDir, tempApiDir);
  }

  const nextCommand = process.platform === "win32" ? "next.cmd" : "next";
  const result = spawnSync(nextCommand, ["build"], {
    cwd: root,
    env: {
      ...process.env,
      GITHUB_PAGES: "true",
      NEXT_PUBLIC_STATIC_PAGES: "true",
    },
    stdio: "inherit",
  });

  process.exitCode = result.status ?? 1;

  if (result.status === 0) {
    writeFileSync(join(root, "out", ".nojekyll"), "");
  }
} finally {
  if (movedApi && existsSync(tempApiDir)) {
    renameSync(tempApiDir, apiDir);
  }
}
