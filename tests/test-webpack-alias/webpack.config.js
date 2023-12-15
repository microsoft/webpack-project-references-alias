const path = require("path");
const { getAliasForProject } = require("@microsoft/webpack-project-references-alias");

module.exports = {
  entry: "./src/index.ts",
  mode: "development",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },
  resolve: {
    extensions: [".ts"],
    conditionNames: ["source", "import", "require"],  
    alias: getAliasForProject()
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: "ts-loader", options: { transpileOnly: true } }
    ]
  }
};
