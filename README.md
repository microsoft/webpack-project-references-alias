# Webpack alias generator for TypeScript project references.

## Description

[TypeScript](https://www.typescriptlang.org/) introduced a feature called [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html) in version 3.0.

This concept, demanded to have the compiled files either checked-in or generated after each branch switch. Not doing this would result in a broken IntelliSense experience.

This drawback was fixed in version 3.7, the TypeScript language server can now inderstand project references. This improved a lot the IntelliSense experience across projects and removed the need to have the compiled files on disk.

The goal of this package is to provide a tool to make webpack understand project references as well. This is needed when want to optimize build time by using transpile-only loaders (ts-loader in transpile-only mode or babel-loader) without the need to have the generated files on disk.

This package create aliases that makes webpack resolve the TypeScript files instead of the generated JavaScript files.

For instance, when package A is a referenced project, the alias will let you do the following import:

```js
import 'A/lib/foo'; // webpack will resolve A/src/foo.ts
```

## Usage

```js
const { getAliasForProject } = require("project-references-alias");

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: [".ts"],
    alias: getAliasForProject()
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: "ts-loader", options: {transpileOnly: true} }
    ]
  }
};

```

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
