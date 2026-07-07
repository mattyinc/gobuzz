import { existsSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const backendPaths = [
  ["src/app/api", ".pages-build-api"],
  ["src/app/admin", ".pages-build-admin"],
  ["middleware.ts", ".pages-build-middleware.ts"],
];

function restoreStagedPath(source, temp) {
  if (existsSync(temp)) {
    if (!existsSync(source)) {
      renameSync(temp, source);
    } else {
      rmSync(temp, { recursive: true, force: true });
    }
  }
}

const paths = backendPaths.map(([source, temp]) => ({
  source: join(root, source),
  temp: join(root, temp),
  moved: false,
}));

for (const item of paths) {
  restoreStagedPath(item.source, item.temp);
  item.moved = existsSync(item.source);
}

try {
  for (const item of paths) {
    if (item.moved) {
      renameSync(item.source, item.temp);
    }
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
  for (const item of paths.toReversed()) {
    if (item.moved && existsSync(item.temp)) {
      renameSync(item.temp, item.source);
    }
  }
}
