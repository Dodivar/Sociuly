import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "designs/**",
      "next-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Produit 100 % francophone : les apostrophes (« l'expérience », « d'un »…)
      // sont omniprésentes dans la copie. Échapper chaque caractère nuirait à la
      // lisibilité du texte. On désactive donc cette règle volontairement.
      "react/no-unescaped-entities": "off",
      // Les paramètres préfixés par « _ » sont intentionnellement inutilisés
      // (signatures de mocks/actions). On les ignore.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];

export default eslintConfig;
