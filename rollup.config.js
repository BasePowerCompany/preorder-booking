import { createRollupConfig } from './rollup.createConfig.js';

export default createRollupConfig((config) => {
  return {
    ...config,
    input: "src/main.ts",
  };
});
