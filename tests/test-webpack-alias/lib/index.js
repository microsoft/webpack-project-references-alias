"use strict";
exports.__esModule = true;
// default import, project with rootDir=src and outDir=lib
var package_a_1 = require("package-a");
console.log(package_a_1.PackageA_default);
// import from outDir, project with rootDir=src and outDir=lib
var module_a_1 = require("package-a/lib/module-a");
console.log(module_a_1.PackageA_moduleA);
// default import, project with rootDir=src and no outDir
var package_b_1 = require("package-b");
console.log(package_b_1.PackageB_default);
// import from rootDir, project with rootDir=src and no outDir
var module_b_1 = require("package-b/src/module-b");
console.log(module_b_1.PackageB_moduleB);
// default import, project with no rootDir and outDir=lib, and with a non-standar project-file name
var package_c_1 = require("package-c");
console.log(package_c_1.PackageC_default);
// import from outDir, project with no rootDir and outDir=lib, and with a non-standar project-file name
var module_c_1 = require("package-c/lib/module-c");
console.log(module_c_1.PackageC_moduleC);
// relative imports from outDir, project with rootDir=src, outDir=lib and no package.json
var lib_1 = require("../../project-d/lib");
var module_d_1 = require("../../project-d/lib/module-d");
console.log(lib_1.ProjectD_default);
console.log(module_d_1.ProjectD_moduleD);
// default import, project with rootDir=src and outDir=lib, with re-export from nested project
var package_e_1 = require("package-e");
// import from outDir, project with rootDir=src and outDir=lib, with re-export from nested project
var module_e_1 = require("package-e/lib/module-e");
// reference all the imported names
console.log(module_e_1.PackageE_moduleE, package_e_1.PackageE_default);
