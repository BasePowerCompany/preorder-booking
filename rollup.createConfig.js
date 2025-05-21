import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import { svelteSVG } from "rollup-plugin-svelte-svg";
import typescript from "@rollup/plugin-typescript";
import css from "rollup-plugin-css-only";
import replace from "@rollup/plugin-replace";
import * as sass from 'sass';
import fs from 'fs';
import path from 'path';

const production = !process.env.ROLLUP_WATCH;
const ASSET_URL =
  "https://cdn.jsdelivr.net/gh/accora-care/configurators@latest/public";

function copyBeforeBodyScript() {
  return {
    name: 'copy-before-body-script',
    writeBundle() {
      const sourcePath = path.resolve('static/webflow/Home/before-body.html');
      const targetPath = path.resolve('public/preorder-app/before-body.html');
      fs.copyFileSync(sourcePath, targetPath);
    }
  };
}

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require("child_process").spawn(
        "npm",
        ["run", "start", "--", "--dev"],
        {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true,
        }
      );

      process.on("SIGTERM", toExit);
      process.on("exit", toExit);
    },
  };
}

const createRollupConfigBase = (foo) => {
  const defaultConfig = {
    input: "src/embed.ts",
    output: {
      sourcemap: true,
      format: "umd",
      exports: "named",
      name: "BasePreorderApp",
      file: "public/preorder-app/embed.js",
    },
    plugins: [
      copyBeforeBodyScript(),
      svelteSVG({
        // optional SVGO options
        // pass empty object to enable defaults
        svgo: {},
      }),
      svelte({
        preprocess: sveltePreprocess({
          sourceMap: !production,
          globalStyle: true,
          postcss: {
            plugins: [require("autoprefixer")()],
          },
          scss: {
            implementation: sass,
            renderSync: true
          },
        }),

        compilerOptions: {
          // enable run-time checks when not in production
          dev: !production,
        },
      }),
      // we'll extract any component CSS out into
      // a separate file - better for performance
      css({ output: "bundle.css" }),

      // If you have external dependencies installed from
      // npm, you'll most likely need these plugins. In
      // some cases you'll need additional configuration -
      // consult the documentation for details:
      // https://github.com/rollup/plugins/tree/master/packages/commonjs
      resolve({
        browser: true,
        dedupe: ["svelte"],
      }),
      commonjs(),
      typescript({
        sourceMap: !production,
        inlineSources: !production,
      }),

      // In dev mode, call `npm run start` once
      // the bundle has been generated
      !production && serve(),

      // Watch the `public` directory and refresh the
      // browser on changes when not in production
      !production && livereload("public"),

      // If we're building for production (npm run build
      // instead of npm run dev), minify
      production && terser(),
    ],
    watch: {
      clearScreen: false,
    },
  };

  return foo(defaultConfig);
};

export const createRollupConfigEmbed = (foo) => {
  const nextConfig = createRollupConfigBase((baseConfig) => {
    return {
      ...baseConfig,
      plugins: [
        ...baseConfig.plugins,
        replace({
          include: ["src/**/*.ts", "src/**/*.svelte"],
          preventAssignment: true,
          values: {
            "process.env.IMAGE_URL": `'${ASSET_URL}'`,
          },
        }),
      ],
    };
  });

  return foo(nextConfig);
};

export const createRollupConfig = (foo) => {
  const nextConfig = createRollupConfigBase((baseConfig) => {
    return {
      ...baseConfig,
      plugins: [
        ...baseConfig.plugins,
        replace({
          include: ["src/**/*.ts", "src/**/*.svelte"],
          preventAssignment: true,
          values: {
            "process.env.IMAGE_URL": "''",
          },
        }),
      ],
    };
  });
  return foo(nextConfig);
};
