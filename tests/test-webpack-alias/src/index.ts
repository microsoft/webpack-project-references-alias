// default import, project with rootDir=src and outDir=lib
import { PackageA_default } from "package-a";
console.log(PackageA_default);

// import from outDir, project with rootDir=src and outDir=lib
import { PackageA_moduleA } from "package-a/lib/module-a";
console.log(PackageA_moduleA);

// default import, project with rootDir=src and no outDir
import { PackageB_default } from "package-b";
console.log(PackageB_default);

// import from rootDir, project with rootDir=src and no outDir
import { PackageB_moduleB } from "package-b/src/module-b";
console.log(PackageB_moduleB);

// default import, project with no rootDir and outDir=lib, and with a non-standar project-file name
import { PackageC_default } from "package-c";
console.log(PackageC_default);

// import from outDir, project with no rootDir and outDir=lib, and with a non-standar project-file name
import { PackageC_moduleC } from "package-c/lib/module-c";
console.log(PackageC_moduleC);

// relative imports from outDir, project with rootDir=src, outDir=lib and no package.json
import { ProjectD_default } from "../../project-d/lib";
import { ProjectD_moduleD } from "../../project-d/lib/module-d";
console.log(ProjectD_default);
console.log(ProjectD_moduleD);

// default import, project with rootDir=src and outDir=lib, with re-export from nested project
import { PackageE_default } from "package-e";

// import from outDir, project with rootDir=src and outDir=lib, with re-export from nested project
import { PackageE_moduleE } from "package-e/lib/module-e";

// reference all the imported names
console.log(PackageE_moduleE, PackageE_default);
