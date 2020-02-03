"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var functional_1 = require("./functional");
function getAliasForProject(project) {
    if (typeof project === 'undefined') {
        project = process.cwd();
    }
    var rootProjectPath = resolveTsConfig(project);
    var alias = functional_1.flattenObject(getReferencedProjectsRecursive(rootProjectPath).map(getAliasFor));
    return alias;
}
exports.getAliasForProject = getAliasForProject;
function resolveTsConfig(p) {
    var isFile = fs.statSync(p).isFile();
    var configPath = isFile ? p : path.join(p, "tsconfig.json");
    return configPath;
}
function getReferencedProjectsRecursive(tsConfigPath) {
    var directReferencedProjects = getReferencedProjects(tsConfigPath);
    return __spreadArrays([tsConfigPath], functional_1.dedupe(functional_1.flatten(directReferencedProjects.map(getReferencedProjectsRecursive))));
}
function getReferencedProjects(tsConfigPath) {
    var _a;
    var projectDir = path.dirname(tsConfigPath);
    var config = require(tsConfigPath);
    var references = (_a = config.references) === null || _a === void 0 ? void 0 : _a.map(function (o) { return o.path; }).map(function (p) { return path.join(projectDir, p); }).map(resolveTsConfig);
    return (references !== null && references !== void 0 ? references : []);
}
function tryGetPackageInfo(dir) {
    try {
        var packageJson = require(path.join(dir, "package.json"));
        return { name: packageJson.name, main: packageJson.main };
    }
    catch (_a) {
        return undefined;
    }
}
function getAliasFor(tsConfigPath) {
    var packageRootDir = path.dirname(tsConfigPath);
    var config = require(tsConfigPath);
    var hasExplicitOutDir = typeof config.compilerOptions.outDir !== 'undefined';
    var rootDir = path.join(packageRootDir, config.compilerOptions.rootDir || "");
    var outDir = hasExplicitOutDir ? path.join(packageRootDir, config.compilerOptions.outDir) : rootDir;
    var packageInfo = tryGetPackageInfo(packageRootDir);
    var alias = {};
    if (typeof packageInfo !== 'undefined') {
        var name_1 = packageInfo.name;
        var main = path.join(packageRootDir, packageInfo.main || './index.js');
        var importLib = outDir.replace(packageRootDir, name_1);
        var importSrc = rootDir;
        var sourceOfMain = main.replace(outDir, rootDir).replace('.js', '');
        alias[importLib] = importSrc;
        alias[name_1 + "$"] = sourceOfMain;
    }
    alias[outDir] = rootDir;
    return alias;
}
