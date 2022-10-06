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

// default module import, project with rootDir=src and outDir=lib
import { PackageD_default } from "package-d";
console.log(PackageD_default);


// default import, project with rootDir=src and outDir=lib, with re-export from nested project
import { PackageE_default } from "package-e";
console.log(PackageE_default);

// import from outDir, project with rootDir=src and outDir=lib, with re-export from nested project
import { PackageE_moduleE } from "package-e/lib/module-e";
console.log(PackageE_moduleE);

// default import, project with rootDir=src and outDir=lib, and tsconfig in a subpackage
import { PackageG_default } from "package-g";
console.log(PackageG_default);

// import from outDir, project with rootDir=src and outDir=lib, and tsconfig in a subpackage
import { PackageG_moduleG } from "package-g/sources/lib/module-g";
console.log(PackageG_moduleG);
