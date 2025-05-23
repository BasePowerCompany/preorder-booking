import { createRollupConfigEmbed } from "./rollup.createConfig.js";

export default createRollupConfigEmbed((config) => {
  return {
    ...config,
    input: "src/embed.ts",
    output: {
      sourcemap: true,
      format: "umd",
      exports: "named",
      name: "AccoraConfigurators",
      file: "public/preorder-app/embed.js",
    },
  };
});
