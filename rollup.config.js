import { createRollupConfig } from "./rollup.createConfig.js";

export default [
  createRollupConfig((config) => {
    return {
      ...config,
      input: "src/embed.ts",
      output: {
        ...config.output,
        file: "public/preorder-app/embed.js",
      },
    };
  }),
  createRollupConfig((config) => {
    return {
      ...config,
      input: "src/embed.ts",
      output: {
        ...config.output,
        file: "public/build/bundle.js",
      },
    };
  }),
];
