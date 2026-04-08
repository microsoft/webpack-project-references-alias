import * as fs from "fs";
import * as path from "path";
import {
  keepApplying
} from "./functional";

type TsConfig = {
  compilerOptions?: { outDir?: string; rootDir?: string };
  references?: { path: string }[];
};

type PackageJson = { module?: string; main?: string; name: string };

type Alias = { [key: string]: string };

export function getAliasForProject(
  project?: string
): { [key: string]: string } {
  if (typeof project === "undefined") {
    project = process.cwd();
  }

  const rootProjectPath = resolveTsConfig(project);
  const allProjects = getReferencedProjectsIterative(rootProjectPath);
  const alias: Alias = {};
  for (const proj of allProjects) {
    Object.assign(alias, getAliasFor(proj));
  }
  return convertSlashes(alias);
}

function toForwardSlashes(input: string): string {
  return input.replace(/\\/g, "/");
}

function convertSlashes(alias: Alias): Alias {
  const result: Alias = {};
  for (const key of Object.keys(alias)) {
    result[toForwardSlashes(key)] = toForwardSlashes(alias[key]);
  }
  return result;
}

function resolveTsConfig(p: string): string {
  const isFile = fs.statSync(p).isFile();
  const configPath = isFile ? p : path.join(p, "tsconfig.json");
  return configPath;
}

function getReferencedProjectsIterative(rootTsConfigPath: string): string[] {
  const visited = new Set<string>();
  const result: string[] = [];
  const queue: string[] = [rootTsConfigPath];

  while (queue.length > 0) {
    const tsConfigPath = queue.pop()!;
    if (visited.has(tsConfigPath)) continue;
    visited.add(tsConfigPath);
    result.push(tsConfigPath);

    const projectDir = path.dirname(tsConfigPath);
    try {
      const config = require(tsConfigPath) as TsConfig;
      const references = config.references
        ?.map(o => o.path)
        .map(p => path.join(projectDir, p))
        .map(resolveTsConfig);
      if (references) {
        for (const ref of references) {
          if (!visited.has(ref)) {
            queue.push(ref);
          }
        }
      }
    } catch {
      // Skip unreadable tsconfig files
    }
  }

  return result;
}

function isPackageDir(dir: string): boolean {
  try {
    return fs.statSync(path.join(dir, "package.json")).isFile();
  } catch {
    return false;
  }
}

function findPackageJsonDir(dir: string): string | undefined {
  return keepApplying(dir, path.dirname)
    .takeUntilStable()
    .first(isPackageDir);
}

function tryGetPackageInfo(
  dir: string
): { name: string; module?: string; main?: string; packageDir: string } | undefined {
  try {
    const packageDir = findPackageJsonDir(dir);
    const packageJson = require(path.join(
      packageDir,
      "package.json"
    )) as PackageJson;
    return { name: packageJson.name, module: packageJson.module, main: packageJson.main, packageDir };
  } catch {
    return undefined;
  }
}

function getAliasFor(tsConfigPath: string): Alias {
  const projectRootDir = path.dirname(tsConfigPath);

  const config = require(tsConfigPath) as TsConfig;

  const hasExplicitOutDir =
    typeof config.compilerOptions.outDir !== "undefined";
  const rootDir = path.join(
    projectRootDir,
    config.compilerOptions.rootDir || ""
  );
  const outDir = hasExplicitOutDir
    ? path.join(projectRootDir, config.compilerOptions.outDir)
    : rootDir;

  const packageInfo = tryGetPackageInfo(projectRootDir);
  const alias = {};
  if (typeof packageInfo !== "undefined") {
    const name = packageInfo.name;
    const main = path.join(
      packageInfo.packageDir,
      packageInfo.module || packageInfo.main || "./index.js"
    );

    const importLib = outDir.replace(packageInfo.packageDir, name);
    const importSrc = rootDir;

    const sourceOfMain = main.replace(outDir, rootDir).replace(".js", "");

    alias[importLib] = importSrc;
    alias[`${name}$`] = sourceOfMain;
  }

  return alias;
}
