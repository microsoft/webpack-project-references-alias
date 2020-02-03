import * as fs from "fs";
import * as path from "path";
import { flatten, flattenObject, dedupe } from "./functional";

type TsConfig = {
  compilerOptions?: { outDir?: string; rootDir?: string };
  references?: { path: string }[];
};

type PackageJson = { main?: string; name: string };

export function getAliasForProject(
  project: string | undefined
): { [key: string]: string } {
  if (typeof project === "undefined") {
    project = process.cwd();
  }

  const rootProjectPath = resolveTsConfig(project);
  const alias = flattenObject(
    getReferencedProjectsRecursive(rootProjectPath).map(getAliasFor)
  );
  return alias;
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

function tryGetPackageInfo(
  dir: string
): { name: string; main?: string } | undefined {
  try {
    const packageJson = require(path.join(dir, "package.json")) as PackageJson;
    return { name: packageJson.name, main: packageJson.main };
  } catch {
    return undefined;
  }
}

function getAliasFor(tsConfigPath: string) {
  const packageRootDir = path.dirname(tsConfigPath);

  const config = require(tsConfigPath) as TsConfig;

  const hasExplicitOutDir =
    typeof config.compilerOptions.outDir !== "undefined";
  const rootDir = path.join(
    packageRootDir,
    config.compilerOptions.rootDir || ""
  );
  const outDir = hasExplicitOutDir
    ? path.join(packageRootDir, config.compilerOptions.outDir)
    : rootDir;

  const packageInfo = tryGetPackageInfo(packageRootDir);
  const alias = {};
  if (typeof packageInfo !== "undefined") {
    const name = packageInfo.name;
    const main = path.join(packageRootDir, packageInfo.main || "./index.js");
    const importLib = outDir.replace(packageRootDir, name);
    const importSrc = rootDir;

    const sourceOfMain = main.replace(outDir, rootDir).replace(".js", "");

    alias[importLib] = importSrc;
    alias[`${name}$`] = sourceOfMain;
  }

  alias[outDir] = rootDir;

  return alias;
}
