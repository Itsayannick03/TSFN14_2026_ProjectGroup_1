import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { 
    files: ["**/*.{js,mjs,cjs}"], 
    plugins: { js }, 
    extends: ["js/recommended"], 
    languageOptions: { 
      globals: {
        ...globals.node,
        ...globals.jest  // Add Jest globals
      } 
    } 
  },
  { 
    files: ["**/*.js"], 
    languageOptions: { 
      sourceType: "commonjs" 
    } 
  },
  // Special configuration for test files
  {
    files: ["**/*.test.js", "**/*.spec.js"],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node
      }
    }
  }
]);