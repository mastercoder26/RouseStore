import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const ROOT = "/Users/akhilkonduru/vsc/RouseStore";
const SRC = path.join(ROOT, "src");

function tryResolvePath(basePath) {
  if (fs.existsSync(basePath)) {
    if (fs.statSync(basePath).isDirectory()) {
      for (const ext of ["/index.ts", "/index.tsx", "/index.js", "/index.mjs"]) {
        if (fs.existsSync(basePath + ext)) return basePath + ext;
      }
    } else {
      return basePath;
    }
  }
  for (const ext of [".ts", ".tsx", ".js", ".mjs"]) {
    if (fs.existsSync(basePath + ext)) return basePath + ext;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const rel = specifier.slice(2);
    const resolved = tryResolvePath(path.join(SRC, rel));
    if (resolved) {
      return nextResolve(pathToFileURL(resolved).href, context);
    }
  } else if (specifier.startsWith("./") || specifier.startsWith("../")) {
    if (context.parentURL && context.parentURL.startsWith("file://")) {
      const parentDir = path.dirname(fileURLToPath(context.parentURL));
      const targetPath = path.resolve(parentDir, specifier);
      const resolved = tryResolvePath(targetPath);
      if (resolved) {
        return nextResolve(pathToFileURL(resolved).href, context);
      }
    }
  }
  return nextResolve(specifier, context);
}
