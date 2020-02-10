import * as fs from "fs";
import * as path from "path";
import { flatten, flattenObject, dedupe, keepApplying } from "./functional";

type TsConfig = {
  compilerOptions?: { outDir?: string; rootDir?: string };
  references?: { path: string }[];
};

type PackageJson = { main?: string; name: string };

type Alias = { [key: string]: string };

export function getAliasForProject(
  project?: string
): { [key: string]: string } {
  if (typeof project === "undefined") {
    project = process.cwd();
  }

  const rootProjectPath = resolveTsConfig(project);
  const alias = flattenObject(
    getReferencedProjectsRecursive(rootProjectPath).map(getAliasFor)
  );
  return convertSlashes(alias);
}

function toForwardSlashes(input: string): string {
  return input.replace(/\\/g, "/");
}

function convertSlashes(alias: Alias): Alias {
  return Object.keys(alias).reduce(
    (prev: Alias, cur: string) => ({
      ...prev,
      ...{ [toForwardSlashes(cur)]: toForwardSlashes(alias[cur]) }
    }),
    {}
  );
}

function resolveTsConfig(p: string): string {
  const isFile = fs.statSync(p).isFile();
  const configPath = isFile ? p : path.join(p, "tsconfig.json");
  return configPath;
}

function getReferencedProjectsRecursive(tsConfigPath: string): string[] {
  const directReferencedProjects = getReferencedProjects(tsConfigPath);
  return [
    tsConfigPath,
    ...dedupe(
      flatten(directReferencedProjects.map(getReferencedProjectsRecursive))
    )
  ];
}

function getReferencedProjects(tsConfigPath: string) {
  const projectDir = path.dirname(tsConfigPath);
  const config = require(tsConfigPath) as TsConfig;
  const references = config.references
    ?.map(o => o.path)
    .map(p => path.join(projectDir, p))
    .map(resolveTsConfig);
  return references ?? [];
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
): { name: string; main?: string; packageDir: string } | undefined {
  try {
    const packageDir = findPackageJsonDir(dir);
    const packageJson = require(path.join(
      packageDir,
      "package.json"
    )) as PackageJson;
    return { name: packageJson.name, main: packageJson.main, packageDir };
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
      packageInfo.main || "./index.js"
    );
    const importLib = outDir.replace(packageInfo.packageDir, name);
    const importSrc = rootDir;

    const sourceOfMain = main.replace(outDir, rootDir).replace(".js", "");

    alias[importLib] = importSrc;
    alias[`${name}$`] = sourceOfMain;
  }

  alias[outDir] = rootDir;

  return alias;
}
