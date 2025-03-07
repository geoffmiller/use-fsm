const typescript = require("rollup-plugin-typescript2");
const pkg = require("./package.json");

module.exports = {
  input: "useFSM.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: "esm",
      exports: "named",
      sourcemap: true,
    },
  ],
  external: ["react"],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      clean: true,
    }),
  ],
};
