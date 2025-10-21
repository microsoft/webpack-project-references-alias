import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { getAliasForProject } from './index';

/**
 * Note: Testing this module is challenging because it uses dynamic require()
 * for loading JSON files. These tests focus on what we can test with the
 * current architecture. For more comprehensive testing, the module would need
 * to be refactored to accept a file loader function as a dependency.
 */

describe('getAliasForProject', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    // Create a temporary directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'webpack-alias-test-'));
  });

  afterEach(() => {
    // Clean up temp directory
    process.chdir(originalCwd);
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  const createProject = (config: {
    name: string;
    path: string;
    tsconfig: any;
    packageJson: any;
    createSrcDir?: boolean;
  }) => {
    const projectPath = path.join(tempDir, config.path);
    fs.mkdirSync(projectPath, { recursive: true });

    if (config.createSrcDir) {
      fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });
    }

    fs.writeFileSync(
      path.join(projectPath, 'tsconfig.json'),
      JSON.stringify(config.tsconfig, null, 2)
    );

    fs.writeFileSync(
      path.join(projectPath, 'package.json'),
      JSON.stringify(config.packageJson, null, 2)
    );

    return projectPath;
  };

  describe('basic functionality', () => {
    it('should generate aliases for a simple project', () => {
      const projectPath = createProject({
        name: 'test-project',
        path: 'project',
        createSrcDir: true,
        tsconfig: {
          compilerOptions: {
            rootDir: './src',
            outDir: './lib',
          },
        },
        packageJson: {
          name: 'test-project',
          main: './lib/index.js',
        },
      });

      const aliases = getAliasForProject(projectPath);

      expect(aliases).toBeDefined();
      expect(typeof aliases).toBe('object');
      // Should have alias for the project itself
      expect(aliases['test-project$']).toBeDefined();
      expect(aliases['test-project/lib']).toBeDefined();
    });

    it('should handle project with one reference', () => {
      // Create package-a
      const packageAPath = createProject({
        name: 'package-a',
        path: 'packages/package-a',
        createSrcDir: true,
        tsconfig: {
          compilerOptions: {
            composite: true,
            rootDir: './src',
            outDir: './lib',
          },
        },
        packageJson: {
          name: 'package-a',
          main: './lib/index.js',
        },
      });

      // Create main project that references package-a
      const projectPath = createProject({
        name: 'main-project',
        path: 'project',
        createSrcDir: true,
        tsconfig: {
          compilerOptions: {
            rootDir: './src',
            outDir: './lib',
          },
          references: [
            { path: '../packages/package-a' },
          ],
        },
        packageJson: {
          name: 'main-project',
          main: './lib/index.js',
        },
      });

      const aliases = getAliasForProject(projectPath);

      expect(aliases).toBeDefined();
      // Should include aliases for both the main project and package-a
      expect(aliases['package-a$']).toContain('package-a');
      expect(aliases['package-a$']).toContain('src');
      expect(aliases['package-a/lib']).toContain('package-a');
      expect(aliases['package-a/lib']).toContain('src');
    });

    it('should handle transitive references', () => {
      // Create package-b (leaf)
      createProject({
        name: 'package-b',
        path: 'packages/package-b',
        createSrcDir: true,
        tsconfig: {
          compilerOptions: {
            composite: true,
            rootDir: './src',
            outDir: './lib',
          },
        },
        packageJson: {
          name: 'package-b',
          main: './lib/index.js',
        },
      });

      // Create package-a (references package-b)
      createProject({
        name: 'package-a',
        path: 'packages/package-a',
        createSrcDir: true,
        tsconfig: {
          compilerOptions: {
            composite: true,
            rootDir: './src',
            outDir: './lib',
          },
          references: [
            { path: '../package-b' },
          ],
        },
        packageJson: {
          name: 'package-a',
          main: './lib/index.js',
        },
      });

      // Create main project (references package-a)
      const projectPath = createProject({
        name: 'main-project',
        path: 'project',
        createSrcDir: true,
        tsconfig: {
          compilerOptions: {
            rootDir: './src',
            outDir: './lib',
          },
          references: [
            { path: '../packages/package-a' },
          ],
        },
        packageJson: {
          name: 'main-project',
          main: './lib/index.js',
        },
      });

      const aliases = getAliasForProject(projectPath);

      expect(aliases).toBeDefined();
      // Should include aliases for all projects in the chain
      expect(Object.keys(aliases).some(k => k.includes('package-a'))).toBe(true);
      expect(Object.keys(aliases).some(k => k.includes('package-b'))).toBe(true);
    });

    it('should use process.cwd() when no path provided', () => {
      const projectPath = createProject({
        name: 'cwd-project',
        path: 'cwd-test',
        createSrcDir: true,
        tsconfig: {
          compilerOptions: {
            rootDir: './src',
            outDir: './lib',
          },
        },
        packageJson: {
          name: 'cwd-project',
          main: './lib/index.js',
        },
      });

      // Change to the project directory
      process.chdir(projectPath);

      const aliases = getAliasForProject();

      expect(aliases).toBeDefined();
      expect(Object.keys(aliases).some(k => k.includes('cwd-project'))).toBe(true);
    });

    it('should handle project with no outDir', () => {
      const projectPath = createProject({
        name: 'no-outdir',
        path: 'no-outdir',
        createSrcDir: true,
        tsconfig: {
          compilerOptions: {
            rootDir: './src',
            // No outDir
          },
        },
        packageJson: {
          name: 'no-outdir',
          main: './src/index.js',
        },
      });

      const aliases = getAliasForProject(projectPath);

      expect(aliases).toBeDefined();
      expect(aliases['no-outdir/src']).toBeDefined();
    });

    it('should handle project with no rootDir', () => {
      const projectPath = createProject({
        name: 'no-rootdir',
        path: 'no-rootdir',
        tsconfig: {
          compilerOptions: {
            // No rootDir
            outDir: './lib',
          },
        },
        packageJson: {
          name: 'no-rootdir',
          main: './lib/index.js',
        },
      });

      const aliases = getAliasForProject(projectPath);

      expect(aliases).toBeDefined();
      expect(aliases['no-rootdir/lib']).toBeDefined();
    });

    it('should prefer module field over main in package.json', () => {
      const projectPath = createProject({
        name: 'with-module',
        path: 'with-module',
        createSrcDir: true,
        tsconfig: {
          compilerOptions: {
            rootDir: './src',
            outDir: './lib',
          },
        },
        packageJson: {
          name: 'with-module',
          module: './lib/esm/index.js',
          main: './lib/index.js',
        },
      });

      const aliases = getAliasForProject(projectPath);

      expect(aliases).toBeDefined();
      // The alias should use the module field
      expect(aliases['with-module$']).toContain('esm');
    });
  });

  describe('path handling', () => {
    it('should convert backslashes to forward slashes', () => {
      const projectPath = createProject({
        name: 'path-test',
        path: 'path-test',
        createSrcDir: true,
        tsconfig: {
          compilerOptions: {
            rootDir: './src',
            outDir: './lib',
          },
        },
        packageJson: {
          name: 'path-test',
          main: './lib/index.js',
        },
      });

      const aliases = getAliasForProject(projectPath);

      // All paths should use forward slashes
      Object.keys(aliases).forEach(key => {
        expect(key).not.toContain('\\');
        expect(aliases[key]).not.toContain('\\');
      });
    });

    it('should handle directory path as input', () => {
      const projectPath = createProject({
        name: 'dir-input',
        path: 'dir-input',
        createSrcDir: true,
        tsconfig: {
          compilerOptions: {
            rootDir: './src',
            outDir: './lib',
          },
        },
        packageJson: {
          name: 'dir-input',
          main: './lib/index.js',
        },
      });

      // Pass directory path (not tsconfig.json file)
      const aliases = getAliasForProject(projectPath);

      expect(aliases).toBeDefined();
      expect(Object.keys(aliases).some(k => k.includes('dir-input'))).toBe(true);
    });

    it('should handle tsconfig.json file path as input', () => {
      const projectPath = createProject({
        name: 'file-input',
        path: 'file-input',
        createSrcDir: true,
        tsconfig: {
          compilerOptions: {
            rootDir: './src',
            outDir: './lib',
          },
        },
        packageJson: {
          name: 'file-input',
          main: './lib/index.js',
        },
      });

      // Pass tsconfig.json file path
      const tsconfigPath = path.join(projectPath, 'tsconfig.json');
      const aliases = getAliasForProject(tsconfigPath);

      expect(aliases).toBeDefined();
      expect(Object.keys(aliases).some(k => k.includes('file-input'))).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle project with no references', () => {
      const projectPath = createProject({
        name: 'no-refs',
        path: 'no-refs',
        createSrcDir: true,
        tsconfig: {
          compilerOptions: {
            rootDir: './src',
            outDir: './lib',
          },
          references: [],
        },
        packageJson: {
          name: 'no-refs',
          main: './lib/index.js',
        },
      });

      const aliases = getAliasForProject(projectPath);

      expect(aliases).toBeDefined();
      expect(typeof aliases).toBe('object');
    });

    it('should handle package.json without main or module fields', () => {
      const projectPath = createProject({
        name: 'no-main',
        path: 'no-main',
        createSrcDir: true,
        tsconfig: {
          compilerOptions: {
            rootDir: './src',
            outDir: './lib',
          },
        },
        packageJson: {
          name: 'no-main',
          // No main or module field
        },
      });

      const aliases = getAliasForProject(projectPath);

      expect(aliases).toBeDefined();
      // Should use default ./index.js which resolves to rootDir/index
      expect(aliases['no-main$']).toBeDefined();
      expect(aliases['no-main$']).toContain('index');
    });
  });
});
