import { resolve as pathResolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fs from "node:fs";

const PROJECT_ROOT = fileURLToPath(new URL("../../", import.meta.url));

export async function resolve(specifier, context, defaultResolve) {
  let target = specifier;
  if (specifier.startsWith("@/")) {
    target = pathResolve(PROJECT_ROOT, "src", specifier.slice(2));
  }

  if (target.startsWith("/") || target.startsWith(".")) {
    const parentDir = context.parentURL ? dirname(fileURLToPath(context.parentURL)) : PROJECT_ROOT;
    const fullPath = target.startsWith("/") ? target : pathResolve(parentDir, target);

    const extensions = ["", ".ts", ".tsx", ".js", ".mjs", "/index.ts", "/index.tsx", "/index.js"];
    for (const ext of extensions) {
      const candidate = fullPath + ext;
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return {
          url: pathToFileURL(candidate).href,
          shortCircuit: true,
        };
      }
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}
